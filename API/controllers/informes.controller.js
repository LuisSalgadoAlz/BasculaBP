const db = require("../lib/prisma");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { QUINTALTONELADA, GRANZA, IMPORTACIONES } = require("../utils/variablesInformes");
const ExcelJS = require('exceljs');

const buquesBoletas = async(req, res) => {
    try{
        const buque = req.query.buque!==undefined ? parseInt(req.query.buque) : null;
        const typeImp = req.query.typeImp!==undefined ? parseInt(req.query.typeImp) : null;
        
        const [sociosImp, facturasImp] = await Promise.all([
            typeImp ? (
                db.boleta.groupBy({
                    by: ['socio', 'idSocio'], 
                    where:{
                        idMovimiento: parseInt(typeImp), 
                        estado:{
                            not: {
                                in: ['Pendiente', 'Cancelada'],
                            },
                        },
                        factura: {
                            not: null,
                        }, 
                        fechaFin: {
                            gt: new Date('2025-06-25'), // Fecha en la que se empezo a utlizar bien el sistema.
                        },
                    },
                    orderBy:{
                        idSocio: 'asc'
                    } 
                })
            ) : null, 
            (buque && typeImp) ? db.facturas.findMany({
                where: {
                    idSocio: parseInt(buque), 
                }
            }) : null,
        ])
        
        res.status(200).send( { sociosImp, facturasImp } )
    }catch(err){
        console.log(err)
    }
}

/**
 * Listo para producion - Revisar Luego
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getResumenBFH = async(req, res) => {
    try{
        const buque = req.query.buque || null;
        const factura = req.query.factura || null;
        const typeImp = req.query.typeImp || null;

        const dataEmpty = [{
            socio: 'No seleccionado',
            fecha: 'No seleccionado', 
            total: 'No seleccionado', 
            pesoNeto: 'No seleccionado',
            pesoTeorico: 'No seleccionado',
            desviacion: 'No seleccionado',  
        }]

        if(buque==undefined || buque==null || isNaN(Number(buque))) return res.status(200).send(dataEmpty)

    
     
        const rawData = await db.boleta.findMany({
            where: {
                idMovimiento: parseInt(typeImp), 
                idSocio: parseInt(buque),
                factura: factura, 
                estado: {
                    not: {
                        in: ['Pendiente', 'Cancelada'],
                    },
                }
            },
            select: {
                socio: true,
                factura: true, 
                fechaFin: true, 
                pesoNeto: true,
                pesoTeorico: true,
                desviacion: true,   
            }
        }); 

        const grouped = rawData.reduce((acc, item) => {
            // Convertir fecha UTC a zona horaria de Honduras (UTC-6)
            const fechaUTC = new Date(item.fechaFin);
            const fechaHonduras = new Date(fechaUTC.getTime() - (6 * 60 * 60 * 1000));
            const fechaLocal = fechaHonduras.toISOString().split('T')[0];
            
            const key = `${item.socio}-${fechaLocal}-${Number(item.factura)}`;
            
            if (!acc[key]) {
                acc[key] = {
                    socio: item.socio,
                    fecha: fechaLocal,
                    factura: Number(item.factura),
                    total: 0, 
                    pesoNeto: 0, 
                    pesoTeorico: 0,
                    desviacion: 0,   
                };
            }
            acc[key].total++;
            acc[key].pesoNeto += item.pesoNeto;
            acc[key].pesoTeorico += item.pesoTeorico;
            acc[key].desviacion += item.desviacion; 
            return acc;
        }, {});

        const result = Object.values(grouped);
        if(result.length==0) return res.status(200).send(dataEmpty)
        return res.status(200).send(result);
    } catch(err) {
        console.log(err);
        res.status(500).send({ error: 'Error interno del servidor' });
    }
}

const getBuqueStats = async(req, res) => {
    try{
        const buque = req.query.buque || null;
        const factura = req.query.factura || null;
        const typeImp = req.query.typeImp || null;

        if (!buque || isNaN(Number(buque))) return res.status(200).json({ error: 'Parámetro buque inválido o no seleccionado' });

        const [facturas, total] = await Promise.all([
            db.facturas.findMany({
                where: {
                    idSocio: parseInt(buque), 
                }
            }), 
            db.boleta.groupBy({
                by: ['idSocio'],
                where: {
                    idSocio: parseInt(buque), 
                    estado: {
                        not: {
                            in: ['Pendiente', 'Cancelada'],
                        },
                    }, 
                    idMovimiento: parseInt(typeImp), 
                    factura: factura,
                }, 
                _sum:{
                    pesoNeto: true, 
                    pesoTeorico: true, 
                    desviacion: true,
                }
            })
        ])
        if(total.length==0) return res.status(200).send({err: 'Buque no seleecionado'})
        const {_sum} = total[0]
        const refactorData = {
            facturas: facturas.length || 'No cuenta con facturas',
            cantidad: facturas[0].Cantidad,
            pesoNeto: (_sum.pesoNeto/QUINTALTONELADA).toFixed(2), 
            pesoTeorico: (_sum.pesoTeorico/QUINTALTONELADA).toFixed(2),
            desviacion: (_sum.desviacion/QUINTALTONELADA).toFixed(2),
            porcentaje: ((_sum.desviacion/QUINTALTONELADA)/(_sum.pesoTeorico/QUINTALTONELADA)*100).toFixed(2)
        }
        return res.status(200).send({...refactorData})
    }catch(err) {
        console.log(err)
    }
}

const getBuqueDetalles = async (req, res) => {
    try {
        const buque = req.query.buque || null;
        const factura = req.query.factura || null;
        const typeImp = req.query.typeImp || null;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Limitar máximo 100
        const skip = (page - 1) * limit;

        const dataEmpty = {
            data: [{
                Buque: 'No seleccionado',
            }],
            pagination: {
                totalData: 1,
                totalPages: 1,
                currentPage: 1,
                limit: 1,
            },
        };

        if (!buque || isNaN(Number(buque))) {
            return res.status(200).json(dataEmpty);
        }

        const whereCondition = {
            idSocio: parseInt(buque),
            idMovimiento: parseInt(typeImp),
            factura: factura,
            estado: {
                not: {
                    in: ['Pendiente', 'Cancelada'],
                },
            },
        };

        const [data, totalData] = await Promise.all([
            db.boleta.findMany({
                where: whereCondition,
                select: {
                numBoleta: true,
                placa: true,
                motorista: true,
                empresa: true,
                producto: true,
                origen: true,
                destino: true,
                usuario: true,
                ordenDeCompra: true,
                pesoNeto: true, 
                pesoTeorico: true,
                factura: true,
                tolva: {
                    select: {
                        principal: { select: { nombre: true } },
                        secundario: { select: { nombre: true } },
                        terciario: { select: { nombre: true } },
                    },
                },
                impContenerizada: true,
                },
                take: limit,
                skip: skip,
            }),
            db.boleta.count({
                where: whereCondition,
            }),
        ]);


        if (data.length === 0) {
            return res.status(200).json(dataEmpty);
        }

        const parsedData = data.map(row => ({
            ...row,
            factura: Number(row.factura) || 0,
            pesoTeorico: row.pesoTeorico ? (row.pesoTeorico / 2204.62).toFixed(2) : 0, // libras → TM
            pesoNeto: row.pesoNeto ? (row.pesoNeto / 2204.62).toFixed(2) : 0,           // libras → TM
            siloPrincipalNombre: row.tolva[0]?.principal?.nombre || ' - ',
            siloSecundarioNombre: row.tolva[0]?.secundario?.nombre || ' - ',
            siloTerciarioNombre: row.tolva[0]?.terciario?.nombre || ' - ',
            desviacion: row.desviacion,
            tolva: undefined, 
        }));

        const totalPages = Math.ceil(totalData / limit);

        return res.status(200).json({
            success: true,
            data: parsedData,
            pagination: {
                totalData,
                totalPages,
                currentPage: page,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        });

    } catch (err) {
        console.error('Error en getBuqueDetalles:', err);
        
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

const getInformePagoAtrasnporte = async (req, res) => {
    try {
        const buque = parseInt(req.params.buque);
        const factura = req.params.factura || null;

        const LB_TO_QQ = 100;
        const PAGO_POR_VIAJE = 317.4;
        const ID_MOVIMIENTO = 2;

        if (!buque || isNaN(buque)) {
            return res.status(400).json({ 
                error: 'Parámetro buque requerido y debe ser un número válido' 
            });
        }

        const [silos, pagos, statsBaprosa] = await Promise.all([
            db.$queryRaw`
                WITH BoletasUnicas AS (
                    SELECT 
                        b.id,
                        b.pesoNeto,
                        CASE 
                            WHEN t.siloSecundario IS NULL THEN s1.nombre
                            ELSE CONCAT(s1.nombre, ' - ', s2.nombre)
                        END AS nombre
                    FROM Boleta b
                    INNER JOIN Tolva t ON b.id = t.idBoleta
                    LEFT JOIN Silos s1 ON s1.id = t.siloPrincipal
                    LEFT JOIN Silos s2 ON s2.id = t.siloSecundario
                    WHERE b.idSocio = ${buque} and factura=${factura}
                    GROUP BY b.id, b.pesoNeto, s1.nombre, s2.nombre, t.siloSecundario
                )
                SELECT 
                    nombre,
                    COUNT(*) as camiones,
                    SUM(pesoNeto)/${LB_TO_QQ} as quintales
                FROM BoletasUnicas
                GROUP BY nombre
                ORDER BY quintales DESC
            `,

            db.boleta.groupBy({
                by: ['empresa'],
                where: {
                    idMovimiento: ID_MOVIMIENTO,
                    idSocio: buque,
                    estado: {
                        not: {
                            in: ['Pendiente', 'Cancelada'],
                        },
                    },
                },
                _count: { _all: true },
                _sum: {
                    pesoNeto: true,
                    pesoTeorico: true,
                    desviacion: true
                }
            }),

            db.boleta.groupBy({
                by: ['idSocio', 'socio'],
                where: {
                    idSocio: buque, 
                    factura: factura,
                    estado: {
                        not: {
                            in: ['Pendiente', 'Cancelada'],
                        },
                    },
                },
                _count: { _all: true },
                _sum: {
                    pesoNeto: true,
                    pesoTeorico: true,
                    desviacion: true
                }
            })
        ]);

        const dataFactura = await db.facturas.findFirst({
            where: {
                factura: factura,
            },
        });

        // Procesamiento de datos
        const convertirQuintal = (peso) => peso ? peso / LB_TO_QQ : 0;

        const pagoTransportes = pagos.map(item => ({
            socio: item.empresa,
            totalViajes: item._count._all,
            pagosDolares: item._count._all * PAGO_POR_VIAJE,
            pesoNetoQQ: convertirQuintal(item._sum.pesoNeto),
            pesoTeoricoQQ: convertirQuintal(item._sum.pesoTeorico),
            desviacionQQ: convertirQuintal(item._sum.desviacion)
        }));

        const ingresoBaprosa = statsBaprosa.map(item => ({
            socio: item.socio,
            totalViajes: item._count._all,
            pesoNetoQQ: convertirQuintal(item._sum.pesoNeto),
            pesoTeoricoQQ: convertirQuintal(item._sum.pesoTeorico),
            desviacionQQ: convertirQuintal(item._sum.desviacion)
        }));

        const comparacionFacturaBascula = {
            factura: {
                quintales: dataFactura?.Cantidad ? (dataFactura.Cantidad * 22.0462262).toFixed(2) : null,
                toneladaMetrica: dataFactura?.Cantidad ? dataFactura.Cantidad.toFixed(2) : null,
            },
            bascula: {
                quintales: (statsBaprosa[0]._sum.pesoNeto / LB_TO_QQ).toFixed(2),
                toneladaMetrica: ((statsBaprosa[0]._sum.pesoNeto / LB_TO_QQ) / 22.0462262).toFixed(2),
            },
            resultado: {
                quintales: dataFactura?.Cantidad
                ? ((statsBaprosa[0]._sum.pesoNeto / LB_TO_QQ) - (dataFactura.Cantidad * 22.0462262)).toFixed(2)
                : null,
                toneladaMetrica: dataFactura?.Cantidad
                ? (((statsBaprosa[0]._sum.pesoNeto / LB_TO_QQ) / 22.0462262) - dataFactura.Cantidad).toFixed(2)
                : null,
            }
        };

        const comparacionFacturaPuerto = {
            factura: {
                quintales: dataFactura?.Cantidad ? (dataFactura.Cantidad * 22.0462262).toFixed(2) : null,
                toneladaMetrica: dataFactura?.Cantidad ? dataFactura.Cantidad.toFixed(2) : null,
            },
            bascula: {
                quintales: (statsBaprosa[0]._sum.pesoTeorico / LB_TO_QQ).toFixed(2),
                toneladaMetrica: ((statsBaprosa[0]._sum.pesoTeorico / LB_TO_QQ) / 22.0462262).toFixed(2),
            },
            resultado: {
                quintales: dataFactura?.Cantidad
                ? ((statsBaprosa[0]._sum.pesoTeorico / LB_TO_QQ) - (dataFactura.Cantidad * 22.0462262)).toFixed(2)
                : null,
                toneladaMetrica: dataFactura?.Cantidad
                ? (((statsBaprosa[0]._sum.pesoTeorico / LB_TO_QQ) / 22.0462262) - dataFactura.Cantidad).toFixed(2)
                : null,
            }
        };

        // Creación del libro de trabajo Excel
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'BAPROSA';
        workbook.lastModifiedBy = 'Sistema de Básculas';
        workbook.created = new Date();
        workbook.modified = new Date();

        // Configuración de colores corporativos
        const COLORS = {
            primary: '1F4E79',        // Azul oscuro para elementos principales
            secondary: '2E75B6',      // Azul medio para elementos secundarios
            accent: '4472C4',         // Azul acento para destacados
            light: 'D9E1F2',          // Azul claro para fondos suaves
            white: 'FFFFFF',          // Blanco
            gray: 'F2F2F2',           // Gris claro para filas alternadas
            darkGray: 'A6A6A6',       // Gris oscuro para bordes y textos secundarios
            success: '70AD47',        // Verde para estados positivos
            warning: 'ED7D31',        // Naranja para alertas
            danger: 'C00000',         // Rojo para errores
            text: '333333',           // Color texto principal
            lightText: '666666'       // Color texto secundario
        };

        // ===== HOJA 1: INFORME DE PAGO DE TRANSPORTE =====
        const sheet1 = workbook.addWorksheet("Informe Pago Transporte", {
            pageSetup: {
                paperSize: 9, // A4
                orientation: 'landscape',
                fitToPage: true,
                fitToWidth: 1,
                fitToHeight: 0,
                margins: {
                    top: 0.7,
                    left: 0.7,
                    bottom: 0.7,
                    right: 0.7,
                    header: 0.3,
                    footer: 0.3
                }
            },
            properties: {
                tabColor: {argb: COLORS.primary}
            }
        });

        // Estilos para la hoja principal
        const styles = {
            title: {
                font: { name: 'Calibri', bold: true, size: 20, color: { argb: COLORS.primary } },
                alignment: { horizontal: 'center', vertical: 'middle' },
                border: { bottom: { style: 'medium', color: { argb: COLORS.primary } } }
            },
            subtitle: {
                font: { name: 'Calibri', bold: true, size: 16, color: { argb: COLORS.secondary } },
                alignment: { horizontal: 'center', vertical: 'middle' }
            },
            sectionTitle: {
                font: { name: 'Calibri', bold: true, size: 14, color: { argb: COLORS.primary } },
                alignment: { horizontal: 'center', vertical: 'middle' },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.light } },
                border: { outline: { style: 'thin', color: { argb: COLORS.primary } } }
            },
            dateInfo: {
                font: { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.lightText } },
                alignment: { horizontal: 'center', vertical: 'middle' }
            },
            header: {
                font: { name: 'Calibri', bold: true, size: 12, color: { argb: COLORS.white } },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primary } },
                alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
                border: {
                    top: { style: 'thin', color: { argb: COLORS.primary } },
                    left: { style: 'thin', color: { argb: COLORS.primary } },
                    bottom: { style: 'thin', color: { argb: COLORS.primary } },
                    right: { style: 'thin', color: { argb: COLORS.primary } }
                }
            },
            data: {
                font: { name: 'Calibri', size: 11, color: { argb: COLORS.text } },
                alignment: { vertical: 'middle' },
                border: {
                    top: { style: 'thin', color: { argb: COLORS.darkGray } },
                    left: { style: 'thin', color: { argb: COLORS.darkGray } },
                    bottom: { style: 'thin', color: { argb: COLORS.darkGray } },
                    right: { style: 'thin', color: { argb: COLORS.darkGray } }
                }
            },
            alternateRow: {
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.light } }
            },
            summary: {
                font: { name: 'Calibri', bold: true, size: 12, color: { argb: COLORS.primary } },
                alignment: { horizontal: 'right', vertical: 'middle' },
                border: { top: { style: 'medium', color: { argb: COLORS.primary } } }
            },
            summaryValue: {
                font: { name: 'Calibri', bold: true, size: 12, color: { argb: COLORS.secondary } },
                alignment: { horizontal: 'center', vertical: 'middle' },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.light } },
                border: {
                    top: { style: 'medium', color: { argb: COLORS.primary } },
                    left: { style: 'thin', color: { argb: COLORS.primary } },
                    bottom: { style: 'thin', color: { argb: COLORS.primary } },
                    right: { style: 'thin', color: { argb: COLORS.primary } }
                }
            },
            footer: {
                font: { name: 'Calibri', italic: true, size: 10, color: { argb: COLORS.lightText } },
                alignment: { horizontal: 'center', vertical: 'middle' },
                border: { top: { style: 'thin', color: { argb: COLORS.primary } } }
            }
        };

        // Logo o placeholder
        try {
            const logoId = workbook.addImage({
                filename: "logo.png",
                extension: "png",
            });
            sheet1.addImage(logoId, {
                tl: { col: 0, row: 0 },
                br: { col: 1, row: 3 },
                editAs: 'oneCell'
            });
        } catch (error) {
            sheet1.mergeCells("A1:A3");
            const placeholderCell = sheet1.getCell("A1");
            placeholderCell.value = "BAPROSA";
            placeholderCell.style = {
                font: { name: 'Arial', bold: true, size: 18, color: { argb: COLORS.primary } },
                alignment: { horizontal: 'center', vertical: 'middle' },
                border: { outline: { style: 'medium', color: { argb: COLORS.primary } } }
            };
        }

        // Encabezado del reporte
        sheet1.mergeCells("B1:M1");
        const titleCell = sheet1.getCell("B1");
        titleCell.value = "BAPROSA - Sistema de Gestión de Básculas";
        Object.assign(titleCell.style, styles.title);
        
        sheet1.mergeCells("B2:M2");
        const subtitleCell = sheet1.getCell("B2");
        subtitleCell.value = "INFORME DE PAGO DE TRANSPORTE";
        Object.assign(subtitleCell.style, styles.subtitle);

        // Información de la factura
        sheet1.mergeCells("B3:M3");
        const infoCell = sheet1.getCell("B3");
        infoCell.value = `Factura: ${factura || 'N/A'} | Proveedor: ${dataFactura?.Proveedor || 'N/A'} | Código: ${dataFactura?.codigoProveedor || 'N/A'}`;
        Object.assign(infoCell.style, styles.dateInfo);
        
        const now = new Date();
        sheet1.mergeCells("B4:M4");
        const dateCell = sheet1.getCell("B4");
        dateCell.value = `Generado el: ${now.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}`;
        Object.assign(dateCell.style, styles.dateInfo);

        sheet1.addRow([]);
        
        // ===== SECCIÓN 1: DISTRIBUCIÓN POR SILOS =====
        const silosRow = sheet1.addRow([]);
        sheet1.mergeCells(`A${sheet1.rowCount}:E${sheet1.rowCount}`);
        const silosTitle = sheet1.getCell(`A${sheet1.rowCount}`);
        silosTitle.value = "DISTRIBUCIÓN POR SILOS";
        Object.assign(silosTitle.style, styles.sectionTitle);
        
        sheet1.addRow([]);
        
        // Encabezados de silos
        const silosHeaders = sheet1.addRow(['Silo', 'Camiones', 'Quintales']);
        silosHeaders.height = 25;
        ['Silo', 'Camiones', 'Quintales'].forEach((header, index) => {
            const cell = sheet1.getCell(sheet1.rowCount, index + 1);
            Object.assign(cell.style, styles.header);
        });
        
        // Datos de silos
        let totalCamiones = 0;
        let totalQuintalesSilos = 0;
        
        silos.forEach((silo, index) => {
            const dataRow = sheet1.addRow([silo.nombre, Number(silo.camiones), Number(silo.quintales)]);
            dataRow.height = 20;
            
            totalCamiones += Number(silo.camiones);
            totalQuintalesSilos += Number(silo.quintales);
            
            [silo.nombre, Number(silo.camiones), Number(silo.quintales)].forEach((value, colIndex) => {
                const cell = sheet1.getCell(sheet1.rowCount, colIndex + 1);
                
                if (index % 2 !== 0) {
                    cell.style = {...styles.data, ...styles.alternateRow};
                } else {
                    Object.assign(cell.style, styles.data);
                }
                
                if (colIndex === 1 || colIndex === 2) {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    if (colIndex === 2) {
                        cell.numFmt = '#,##0.00 "qq"';
                    }
                }
            });
        });
        
        // Totales de silos
        const silosTotalsRow = sheet1.addRow(['TOTALES:', totalCamiones, totalQuintalesSilos]);
        ['', totalCamiones, totalQuintalesSilos].forEach((value, colIndex) => {
            const cell = sheet1.getCell(sheet1.rowCount, colIndex + 1);
            if (colIndex === 0) {
                cell.style = styles.summary;
            } else {
                cell.style = styles.summaryValue;
                if (colIndex === 2) {
                    cell.numFmt = '#,##0.00 "qq"';
                }
            }
        });

        sheet1.addRow([]);
        sheet1.addRow([]);

        // ===== SECCIÓN 2: PAGO DE TRANSPORTES =====
        const transporteRow = sheet1.addRow([]);
        sheet1.mergeCells(`A${sheet1.rowCount}:G${sheet1.rowCount}`);
        const transporteTitle = sheet1.getCell(`A${sheet1.rowCount}`);
        transporteTitle.value = "PAGO DE TRANSPORTES";
        Object.assign(transporteTitle.style, styles.sectionTitle);
        
        sheet1.addRow([]);
        
        // Encabezados de pago de transportes
        const transporteHeaders = sheet1.addRow(['Empresa', 'Total Viajes', 'Pago USD', 'Peso Neto (qq)', 'Peso Teórico (qq)', 'Desviación (qq)']);
        transporteHeaders.height = 25;
        ['Empresa', 'Total Viajes', 'Pago USD', 'Peso Neto (qq)', 'Peso Teórico (qq)', 'Desviación (qq)'].forEach((header, index) => {
            const cell = sheet1.getCell(sheet1.rowCount, index + 1);
            Object.assign(cell.style, styles.header);
        });
        
        // Datos de pago de transportes
        let totalViajesTransporte = 0;
        let totalPagosUSD = 0;
        let totalPesoNetoTransporte = 0;
        let totalPesoTeoricoTransporte = 0;
        let totalDesviacionTransporte = 0;
        
        pagoTransportes.forEach((pago, index) => {
            const dataRow = sheet1.addRow([
                pago.socio, 
                pago.totalViajes, 
                pago.pagosDolares, 
                pago.pesoNetoQQ, 
                pago.pesoTeoricoQQ, 
                pago.desviacionQQ
            ]);
            dataRow.height = 20;
            
            totalViajesTransporte += pago.totalViajes;
            totalPagosUSD += pago.pagosDolares;
            totalPesoNetoTransporte += pago.pesoNetoQQ;
            totalPesoTeoricoTransporte += pago.pesoTeoricoQQ;
            totalDesviacionTransporte += pago.desviacionQQ;
            
            [pago.socio, pago.totalViajes, pago.pagosDolares, pago.pesoNetoQQ, pago.pesoTeoricoQQ, pago.desviacionQQ].forEach((value, colIndex) => {
                const cell = sheet1.getCell(sheet1.rowCount, colIndex + 1);
                
                if (index % 2 !== 0) {
                    cell.style = {...styles.data, ...styles.alternateRow};
                } else {
                    Object.assign(cell.style, styles.data);
                }
                
                if (colIndex >= 1) {
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    if (colIndex === 2) {
                        cell.numFmt = '$#,##0.00';
                    } else if (colIndex >= 3) {
                        cell.numFmt = '#,##0.00 "qq"';
                        
                        // Colorear desviación
                        if (colIndex === 5) {
                            if (value > -1 && value < 1) {
                                cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.success } };
                            } else {
                                cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.danger } };
                            }
                        }
                    }
                }
            });
        });
        
        // Totales de pago de transportes
        const transporteTotalsRow = sheet1.addRow(['TOTALES:', totalViajesTransporte, totalPagosUSD, totalPesoNetoTransporte, totalPesoTeoricoTransporte, totalDesviacionTransporte]);
        ['', totalViajesTransporte, totalPagosUSD, totalPesoNetoTransporte, totalPesoTeoricoTransporte, totalDesviacionTransporte].forEach((value, colIndex) => {
            const cell = sheet1.getCell(sheet1.rowCount, colIndex + 1);
            if (colIndex === 0) {
                cell.style = styles.summary;
            } else {
                cell.style = styles.summaryValue;
                if (colIndex === 2) {
                    cell.numFmt = '$#,##0.00';
                } else if (colIndex >= 3) {
                    cell.numFmt = '#,##0.00 "qq"';
                }
            }
        });

        sheet1.addRow([]);
        sheet1.addRow([]);

        // ===== SECCIÓN 3: INGRESO BAPROSA =====
        const baprosRow = sheet1.addRow([]);
        sheet1.mergeCells(`A${sheet1.rowCount}:F${sheet1.rowCount}`);
        const baprosaTitle = sheet1.getCell(`A${sheet1.rowCount}`);
        baprosaTitle.value = "INGRESO BAPROSA";
        Object.assign(baprosaTitle.style, styles.sectionTitle);
        
        sheet1.addRow([]);
        
        // Encabezados de ingreso BAPROSA
        const baprosaHeaders = sheet1.addRow(['Socio', 'Total Viajes', 'Peso Neto (qq)', 'Peso Teórico (qq)', 'Desviación (qq)']);
        baprosaHeaders.height = 25;
        ['Socio', 'Total Viajes', 'Peso Neto (qq)', 'Peso Teórico (qq)', 'Desviación (qq)'].forEach((header, index) => {
            const cell = sheet1.getCell(sheet1.rowCount, index + 1);
            Object.assign(cell.style, styles.header);
        });
        
        // Datos de ingreso BAPROSA
        ingresoBaprosa.forEach((ingreso, index) => {
            const dataRow = sheet1.addRow([
                ingreso.socio, 
                ingreso.totalViajes, 
                ingreso.pesoNetoQQ, 
                ingreso.pesoTeoricoQQ, 
                ingreso.desviacionQQ
            ]);
            dataRow.height = 20;
            
            [ingreso.socio, ingreso.totalViajes, ingreso.pesoNetoQQ, ingreso.pesoTeoricoQQ, ingreso.desviacionQQ].forEach((value, colIndex) => {
                const cell = sheet1.getCell(sheet1.rowCount, colIndex + 1);
                
                if (index % 2 !== 0) {
                    cell.style = {...styles.data, ...styles.alternateRow};
                } else {
                    Object.assign(cell.style, styles.data);
                }
                
                if (colIndex >= 1) {
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    if (colIndex >= 2) {
                        cell.numFmt = '#,##0.00 "qq"';
                        
                        // Colorear desviación
                        if (colIndex === 4) {
                            if (value > -1 && value < 1) {
                                cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.success } };
                            } else {
                                cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.danger } };
                            }
                        }
                    }
                }
            });
        });

        sheet1.addRow([]);
        sheet1.addRow([]);

        // ===== SECCIÓN 4: COMPARACIONES =====
        const comparacionRow = sheet1.addRow([]);
        sheet1.mergeCells(`A${sheet1.rowCount}:I${sheet1.rowCount}`);
        const comparacionTitle = sheet1.getCell(`A${sheet1.rowCount}`);
        comparacionTitle.value = "COMPARACIÓN FACTURA VS BÁSCULA";
        Object.assign(comparacionTitle.style, styles.sectionTitle);
        
        sheet1.addRow([]);
        
        // Encabezados de comparación
        const comparacionHeaders = sheet1.addRow(['', 'Factura (qq)', 'Factura (TM)', 'Báscula (qq)', 'Báscula (TM)', 'Diferencia (qq)', 'Diferencia (TM)']);
        comparacionHeaders.height = 25;
        ['', 'Factura (qq)', 'Factura (TM)', 'Báscula (qq)', 'Báscula (TM)', 'Diferencia (qq)', 'Diferencia (TM)'].forEach((header, index) => {
            const cell = sheet1.getCell(sheet1.rowCount, index + 1);
            Object.assign(cell.style, styles.header);
        });
        
        // Datos de comparación báscula
        const basiculaRow = sheet1.addRow([
            'Vs. Báscula',
            comparacionFacturaBascula.factura.quintales,
            comparacionFacturaBascula.factura.toneladaMetrica,
            comparacionFacturaBascula.bascula.quintales,
            comparacionFacturaBascula.bascula.toneladaMetrica,
            comparacionFacturaBascula.resultado.quintales,
            comparacionFacturaBascula.resultado.toneladaMetrica
        ]);
        basiculaRow.height = 20;
        
        // Datos de comparación puerto
        const puertoRow = sheet1.addRow([
            'Vs. Puerto',
            comparacionFacturaPuerto.factura.quintales,
            comparacionFacturaPuerto.factura.toneladaMetrica,
            comparacionFacturaPuerto.bascula.quintales,
            comparacionFacturaPuerto.bascula.toneladaMetrica,
            comparacionFacturaPuerto.resultado.quintales,
            comparacionFacturaPuerto.resultado.toneladaMetrica
        ]);
        puertoRow.height = 20;
        
        // Aplicar estilos a las comparaciones
        [basiculaRow, puertoRow].forEach((row, rowIndex) => {
            row.eachCell((cell, colIndex) => {
                if (rowIndex % 2 !== 0) {
                    cell.style = {...styles.data, ...styles.alternateRow};
                } else {
                    Object.assign(cell.style, styles.data);
                }
                
                if (colIndex >= 2) {
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    if (colIndex === 2 || colIndex === 4 || colIndex === 6) {
                        cell.numFmt = '#,##0.00 "qq"';
                    } else if (colIndex === 3 || colIndex === 5 || colIndex === 7) {
                        cell.numFmt = '#,##0.000 "TM"';
                    }
                    
                    // Colorear diferencias
                    if (colIndex >= 6) {
                        const value = parseFloat(cell.value);
                        if (value > -1 && value < 1) {
                            cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.success } };
                        } else {
                            cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.danger } };
                        }
                    }
                }
            });
        });

        // Configurar anchos de columna
        const columnWidths = [25, 15, 15, 15, 15, 15, 15, 15, 15];
        columnWidths.forEach((width, i) => {
            sheet1.getColumn(i + 1).width = width;
        });

        // Pie de página
        sheet1.addRow([]);
        sheet1.addRow([]);
        const footerRow = sheet1.rowCount + 1;
        sheet1.mergeCells(`A${footerRow}:I${footerRow}`);
        const footerCell = sheet1.getCell(`A${footerRow}`);
        footerCell.value = 'BAPROSA - Sistema de Gestión de Básculas © ' + new Date().getFullYear();
        Object.assign(footerCell.style, styles.footer);

        // ===== HOJA 2: DETALLE DE TRANSPORTES =====
        const sheet2 = workbook.addWorksheet('Detalle Transportes', {
            pageSetup: {
                paperSize: 9,
                orientation: 'landscape',
                fitToPage: true,
                fitToWidth: 1,
                fitToHeight: 0,
                margins: {
                    top: 0.7,
                    left: 0.7,
                    bottom: 0.7,
                    right: 0.7,
                    header: 0.3,
                    footer: 0.3
                }
            },
            properties: { 
                tabColor: {argb: COLORS.secondary} 
            }
        });

        // Encabezado de la hoja de detalle
        sheet2.mergeCells("A1:H1");
        const detailTitle = sheet2.getCell("A1");
        detailTitle.value = "DETALLE DE TRANSPORTES POR EMPRESA";
        detailTitle.style = {
            font: { name: 'Calibri', bold: true, size: 16, color: { argb: COLORS.primary } },
            alignment: { horizontal: 'center', vertical: 'middle' },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.light } },
            border: { outline: { style: 'thin', color: { argb: COLORS.primary } } }
        };

        sheet2.mergeCells("A2:H2");
        const detailDateCell = sheet2.getCell("A2");
        detailDateCell.value = `Factura: ${factura || 'N/A'} | Generado el: ${now.toLocaleDateString('es-ES')}`;
        Object.assign(detailDateCell.style, styles.dateInfo);

        sheet2.addRow([]);

        // Encabezados de detalle de transportes
        const detailHeaders = ['Empresa', 'Total Viajes', 'Peso Neto (qq)', 'Peso Teórico (qq)', 'Desviación (qq)', 'Pago por Viaje', 'Total a Pagar', 'Observaciones'];
        const detailHeadersRow = sheet2.addRow(detailHeaders);
        detailHeadersRow.height = 25;

        detailHeaders.forEach((header, index) => {
            const cell = sheet2.getCell(sheet2.rowCount, index + 1);
            Object.assign(cell.style, styles.header);
        });

        // Configurar anchos de columna para detalle
        const detailColumnWidths = [30, 15, 18, 18, 18, 18, 18, 25];
        detailColumnWidths.forEach((width, i) => {
            sheet2.getColumn(i + 1).width = width;
        });

        // Llenar datos de detalle de transportes
        let totalGeneralViajes = 0;
        let totalGeneralPagos = 0;

        pagoTransportes.forEach((pago, index) => {
            const observacion = pago.desviacionQQ > 2 ? 'Revisar desviación alta' : 
                               pago.desviacionQQ < -2 ? 'Revisar desviación negativa' : 'Normal';
            
            const dataRow = sheet2.addRow([
                pago.socio,
                pago.totalViajes,
                pago.pesoNetoQQ,
                pago.pesoTeoricoQQ,
                pago.desviacionQQ,
                PAGO_POR_VIAJE,
                pago.pagosDolares,
                observacion
            ]);
            dataRow.height = 20;

            totalGeneralViajes += pago.totalViajes;
            totalGeneralPagos += pago.pagosDolares;

            // Aplicar estilos
            dataRow.eachCell((cell, colIndex) => {
                if (index % 2 !== 0) {
                    cell.style = {...styles.data, ...styles.alternateRow};
                } else {
                    Object.assign(cell.style, styles.data);
                }

                // Formatos específicos
                if (colIndex === 2) {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                } else if (colIndex >= 3 && colIndex <= 5) {
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    cell.numFmt = '#,##0.00 "qq"';
                    
                    // Colorear desviación
                    if (colIndex === 5) {
                        if (pago.desviacionQQ > -1 && pago.desviacionQQ < 1) {
                            cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.success } };
                        } else {
                            cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.danger } };
                        }
                    }
                } else if (colIndex === 6 || colIndex === 7) {
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    cell.numFmt = '$#,##0.00';
                }
            });
        });

        // Totales para detalle
        const detailTotalsRow = sheet2.addRow(['TOTALES:', totalGeneralViajes, '', '', '', '', totalGeneralPagos, '']);
        ['', totalGeneralViajes, '', '', '', '', totalGeneralPagos, ''].forEach((value, colIndex) => {
            const cell = sheet2.getCell(sheet2.rowCount, colIndex + 1);
            if (colIndex === 0) {
                cell.style = styles.summary;
            } else if (value !== '') {
                cell.style = styles.summaryValue;
                if (colIndex === 6) {
                    cell.numFmt = '$#,##0.00';
                }
            }
        });

        // ===== HOJA 3: ANÁLISIS DE SILOS =====
        const sheet3 = workbook.addWorksheet('Análisis Silos', {
            properties: { tabColor: {argb: COLORS.accent} }
        });

        sheet3.mergeCells("A1:F1");
        const silosAnalysisTitle = sheet3.getCell("A1");
        silosAnalysisTitle.value = "ANÁLISIS DETALLADO DE SILOS";
        silosAnalysisTitle.style = {
            font: { name: 'Calibri', bold: true, size: 16, color: { argb: COLORS.primary } },
            alignment: { horizontal: 'center', vertical: 'middle' },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.light } },
            border: { outline: { style: 'thin', color: { argb: COLORS.primary } } }
        };

        sheet3.addRow([]);
        sheet3.addRow([]);

        // Encabezados para análisis de silos
        const silosAnalysisHeaders = ['Silo', 'Camiones', 'Quintales', 'Porcentaje', 'Promedio por Camión', 'Estado'];
        const silosAnalysisHeadersRow = sheet3.addRow(silosAnalysisHeaders);
        silosAnalysisHeadersRow.height = 25;

        silosAnalysisHeaders.forEach((header, index) => {
            const cell = sheet3.getCell(sheet3.rowCount, index + 1);
            Object.assign(cell.style, styles.header);
        });

        // Configurar anchos de columna
        for (let i = 1; i <= 6; i++) {
            sheet3.getColumn(i).width = i === 1 ? 35 : 18;
        }

        // Datos de análisis de silos
        silos.forEach((silo, index) => {
            const porcentaje = (Number(silo.quintales) / totalQuintalesSilos) * 100;
            const promedioPorCamion = Number(silo.quintales) / Number(silo.camiones);
            const estado = promedioPorCamion > 25 ? 'Óptimo' : 
                          promedioPorCamion > 20 ? 'Bueno' : 
                          promedioPorCamion > 15 ? 'Regular' : 'Bajo';

            const dataRow = sheet3.addRow([
                silo.nombre,
                Number(silo.camiones),
                Number(silo.quintales),
                porcentaje,
                promedioPorCamion,
                estado
            ]);
            dataRow.height = 20;

            dataRow.eachCell((cell, colIndex) => {
                if (index % 2 !== 0) {
                    cell.style = {...styles.data, ...styles.alternateRow};
                } else {
                    Object.assign(cell.style, styles.data);
                }

                if (colIndex === 2) {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                } else if (colIndex === 3) {
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    cell.numFmt = '#,##0.00 "qq"';
                } else if (colIndex === 4) {
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    cell.numFmt = '#0.00"%"';
                } else if (colIndex === 5) {
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    cell.numFmt = '#,##0.00 "qq"';
                } else if (colIndex === 6) {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    // Colorear según estado
                    if (estado === 'Óptimo') {
                        cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.success } };
                    } else if (estado === 'Bajo') {
                        cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.danger } };
                    } else {
                        cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.warning } };
                    }
                }
            });
        });

        // ===== HOJA 4: RESUMEN EJECUTIVO =====
        const sheet4 = workbook.addWorksheet('Resumen Ejecutivo', {
            properties: { tabColor: {argb: COLORS.warning} }
        });

        sheet4.mergeCells("A1:F1");
        const summaryTitle = sheet4.getCell("A1");
        summaryTitle.value = "RESUMEN EJECUTIVO";
        summaryTitle.style = {
            font: { name: 'Calibri', bold: true, size: 16, color: { argb: COLORS.primary } },
            alignment: { horizontal: 'center', vertical: 'middle' },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.light } },
            border: { outline: { style: 'thin', color: { argb: COLORS.primary } } }
        };

        sheet4.addRow([]);
        sheet4.addRow([]);

        // Resumen ejecutivo con datos clave
        const summaryData = [
            ['DATOS GENERALES', ''],
            ['Factura:', factura || 'N/A'],
            ['Proveedor:', dataFactura?.Proveedor || 'N/A'],
            ['Código Proveedor:', dataFactura?.codigoProveedor || 'N/A'],
            ['Cantidad Facturada (TM):', dataFactura?.Cantidad || 'N/A'],
            ['', ''],
            ['TOTALES DE TRANSPORTE', ''],
            ['Total de Viajes:', totalViajesTransporte],
            ['Total Pago USD:', `${totalPagosUSD.toFixed(2)}`],
            ['Peso Neto Total (qq):', `${totalPesoNetoTransporte.toFixed(2)} qq`],
            ['Desviación Total (qq):', `${totalDesviacionTransporte.toFixed(2)} qq`],
            ['', ''],
            ['DISTRIBUCIÓN DE SILOS', ''],
            ['Total de Camiones:', totalCamiones],
            ['Total Quintales:', `${totalQuintalesSilos.toFixed(2)} qq`],
            ['Promedio por Camión:', `${(totalQuintalesSilos/totalCamiones).toFixed(2)} qq`]
        ];

        summaryData.forEach((row, index) => {
            const dataRow = sheet4.addRow(row);
            dataRow.height = 20;

            dataRow.eachCell((cell, colIndex) => {
                if (row[0].includes('DATOS') || row[0].includes('TOTALES') || row[0].includes('DISTRIBUCIÓN')) {
                    cell.style = {
                        font: { name: 'Calibri', bold: true, size: 14, color: { argb: COLORS.primary } },
                        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.light } },
                        alignment: { horizontal: 'center', vertical: 'middle' },
                        border: { outline: { style: 'thin', color: { argb: COLORS.primary } } }
                    };
                } else if (row[0] === '') {
                    // Fila vacía
                } else {
                    if (colIndex === 1) {
                        cell.style = {
                            font: { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.text } },
                            alignment: { horizontal: 'right', vertical: 'middle' }
                        };
                    } else {
                        cell.style = {
                            font: { name: 'Calibri', size: 11, color: { argb: COLORS.text } },
                            alignment: { horizontal: 'left', vertical: 'middle' }
                        };
                    }
                }
            });
        });

        // Configurar anchos de columna para resumen ejecutivo
        sheet4.getColumn(1).width = 25;
        sheet4.getColumn(2).width = 30;

        // Configurar la respuesta para descargar el archivo Excel
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="informe_pago_transporte_${factura || 'sin_factura'}_${new Date().toISOString().split('T')[0]}.xlsx"`);
        
        // Escribir el archivo Excel a la respuesta
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error en exportInformePagoTransporte:', error);
        
        return res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const exportR1Importaciones =  async(req, res) => {
    try{
        const buque = req.query.buque || null;
        const factura = req.query.factura || 1;
        const where = {
            idSocio: parseInt(buque),
            idMovimiento: IMPORTACIONES,
            idProducto: GRANZA,
            estado: {
                not: {
                    in: ['Pendiente', 'Cancelada'],
                },
            },  
        }
        // Obtener datos del resumen BFH por factura correspondiente
        const rawData = await db.$queryRaw`
        WITH numerados AS (
            SELECT *,
                ROW_NUMBER() OVER (PARTITION BY nviajes ORDER BY numBoleta) AS factura
            FROM boleta
            WHERE estado != 'Pendiente' AND estado != 'Cancelada' AND idSocio = ${buque} AND idMovimiento = ${IMPORTACIONES} AND idProducto = ${GRANZA} AND Nviajes is not null
        )
        SELECT socio, fechaFin, pesoNeto, pesoTeorico, desviacion, factura
        FROM numerados
        ORDER BY factura ASC, fechaFin ASC`;
    
        const grouped = rawData.reduce((acc, item) => {
            // Convertir fecha UTC a zona horaria de Honduras (UTC-6)
            const fechaUTC = new Date(item.fechaFin);
            const fechaHonduras = new Date(fechaUTC.getTime() - (6 * 60 * 60 * 1000));
            const fechaLocal = fechaHonduras.toISOString().split('T')[0];
            
            const key = `${item.socio}-${fechaLocal}-${Number(item.factura)}`;
            
            if (!acc[key]) {
                acc[key] = {
                    socio: item.socio,
                    fecha: fechaLocal,
                    factura: Number(item.factura),
                    total: 0, 
                    pesoNeto: 0, 
                    pesoTeorico: 0,
                    desviacion: 0,   
                };
            }
            acc[key].total++;
            acc[key].pesoNeto += item.pesoNeto;
            acc[key].pesoTeorico += item.pesoTeorico;
            acc[key].desviacion += item.desviacion; 
            return acc;
        }, {});

        const result = Object.values(grouped);
        
        // Obtener datos de detalles del buque
        const buqueDetalles = await db.$queryRaw`
            WITH numerados AS (
                SELECT *,
                ROW_NUMBER() OVER (PARTITION BY Nviajes ORDER BY numBoleta) AS factura
                FROM boleta
                WHERE estado != 'Pendiente' 
                AND estado != 'Cancelada' 
                AND idSocio = ${buque} 
                AND idMovimiento = ${IMPORTACIONES} 
                AND idProducto = ${GRANZA} 
                AND Nviajes IS NOT NULL
            )
            SELECT *
            FROM numerados
            ORDER BY factura ASC, Nviajes ASC
        `

        // Nueva consulta para la hoja de detalles completos
        const detallesCompletos = await db.$queryRaw`
            WITH numerados AS (
                SELECT *,
                ROW_NUMBER() OVER (PARTITION BY Nviajes ORDER BY numBoleta) AS factura
                FROM boleta
                WHERE estado != 'Pendiente' 
                AND estado != 'Cancelada' 
                AND idSocio = ${buque} 
                AND idMovimiento = ${IMPORTACIONES} 
                AND idProducto = ${GRANZA} 
                AND Nviajes IS NOT NULL
            )
            SELECT DISTINCT 
                n.factura,
                n.numBoleta, 
                n.Nviajes, 
                n.NSalida, 
                n.socio, 
                n.placa, 
                n.empresa, 
                -- Pesos originales en libras
                n.pesoFinal as Tara, 
                n.pesoInicial as PesoBruto, 
                n.pesoNeto,
                ROUND(n.pesoNeto / 100.0, 2) as PesoNetoQuintales,
                ROUND(n.pesoNeto / 2204.62, 3) as PesoNetoToneladas,
                n.pesoTeorico, 
                ROUND(n.pesoTeorico / 100.0, 2) as PesoTeoricoQuintales,
                ROUND(n.pesoTeorico / 2204.62, 3) as PesoTeoricoToneladas,
                -- Otros campos
                n.desviacion,
                ROUND(n.desviacion / 100.0, 2) as DesviacionEnQuintales,
                ROUND(n.desviacion / 2204.62, 3) as DesviacionEnTonelada,
                n.sello1, 
                n.sello2, 
                n.sello3, 
                n.sello4, 
                n.sello5, 
                n.sello6,
                n.tolvaAsignada,
                s1.nombre AS siloPrincipal,
                s2.nombre AS siloSecundario,
                s3.nombre AS siloTerciario
            FROM numerados as n
            INNER JOIN Tolva as t ON n.id = t.idBoleta
            LEFT JOIN Silos as s1 ON s1.id = t.siloPrincipal
            LEFT JOIN Silos as s2 ON s2.id = t.siloSecundario  
            LEFT JOIN Silos as s3 ON s3.id = t.SiloTerciario 
            ORDER BY factura ASC, Nviajes ASC
        `;
        
        // Verificación de datos del resumen
        if (result.length === 0) {
            result.push({
                socio: 'No seleccionado',
                fecha: 'No seleccionado',
                total: 'No seleccionado',
                pesoNeto: 'No seleccionado',
                pesoTeorico: 'No seleccionado',
                desviacion: 'No seleccionado'
            });
        }

        // Creación del libro de trabajo
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'BAPROSA';
        workbook.lastModifiedBy = 'Sistema de Básculas';
        workbook.created = new Date();
        workbook.modified = new Date();
        
        // Configuración de colores corporativos
        const COLORS = {
            primary: '1F4E79',        // Azul oscuro para elementos principales
            secondary: '2E75B6',      // Azul medio para elementos secundarios
            accent: '4472C4',         // Azul acento para destacados
            light: 'D9E1F2',          // Azul claro para fondos suaves
            white: 'FFFFFF',          // Blanco
            gray: 'F2F2F2',           // Gris claro para filas alternadas
            darkGray: 'A6A6A6',       // Gris oscuro para bordes y textos secundarios
            success: '70AD47',        // Verde para estados positivos
            warning: 'ED7D31',        // Naranja para alertas
            danger: 'C00000',         // Rojo para errores
            text: '333333',           // Color texto principal
            lightText: '666666'       // Color texto secundario
        };

        // ===== HOJA 1: RESUMEN BFH =====
        const sheet1 = workbook.addWorksheet("Resumen BFH", {
            pageSetup: {
                paperSize: 9, // A4
                orientation: 'landscape',
                fitToPage: true,
                fitToWidth: 1,
                fitToHeight: 0,
                margins: {
                    top: 0.7,
                    left: 0.7,
                    bottom: 0.7,
                    right: 0.7,
                    header: 0.3,
                    footer: 0.3
                }
            },
            properties: {
                tabColor: {argb: COLORS.primary}
            }
        });

        // Estilos para la hoja principal
        const styles = {
            title: {
                font: { name: 'Calibri', bold: true, size: 20, color: { argb: COLORS.primary } },
                alignment: { horizontal: 'center', vertical: 'middle' },
                border: { bottom: { style: 'medium', color: { argb: COLORS.primary } } }
            },
            subtitle: {
                font: { name: 'Calibri', bold: true, size: 16, color: { argb: COLORS.secondary } },
                alignment: { horizontal: 'center', vertical: 'middle' }
            },
            sectionTitle: {
                font: { name: 'Calibri', bold: true, size: 14, color: { argb: COLORS.primary } },
                alignment: { horizontal: 'center', vertical: 'middle' },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.light } },
                border: { outline: { style: 'thin', color: { argb: COLORS.primary } } }
            },
            dateInfo: {
                font: { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.lightText } },
                alignment: { horizontal: 'center', vertical: 'middle' }
            },
            header: {
                font: { name: 'Calibri', bold: true, size: 12, color: { argb: COLORS.white } },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primary } },
                alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
                border: {
                    top: { style: 'thin', color: { argb: COLORS.primary } },
                    left: { style: 'thin', color: { argb: COLORS.primary } },
                    bottom: { style: 'thin', color: { argb: COLORS.primary } },
                    right: { style: 'thin', color: { argb: COLORS.primary } }
                }
            },
            data: {
                font: { name: 'Calibri', size: 11, color: { argb: COLORS.text } },
                alignment: { vertical: 'middle' },
                border: {
                    top: { style: 'thin', color: { argb: COLORS.darkGray } },
                    left: { style: 'thin', color: { argb: COLORS.darkGray } },
                    bottom: { style: 'thin', color: { argb: COLORS.darkGray } },
                    right: { style: 'thin', color: { argb: COLORS.darkGray } }
                }
            },
            alternateRow: {
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.light } }
            },
            summary: {
                font: { name: 'Calibri', bold: true, size: 12, color: { argb: COLORS.primary } },
                alignment: { horizontal: 'right', vertical: 'middle' },
                border: { top: { style: 'medium', color: { argb: COLORS.primary } } }
            },
            summaryValue: {
                font: { name: 'Calibri', bold: true, size: 12, color: { argb: COLORS.secondary } },
                alignment: { horizontal: 'center', vertical: 'middle' },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.light } },
                border: {
                    top: { style: 'medium', color: { argb: COLORS.primary } },
                    left: { style: 'thin', color: { argb: COLORS.primary } },
                    bottom: { style: 'thin', color: { argb: COLORS.primary } },
                    right: { style: 'thin', color: { argb: COLORS.primary } }
                }
            },
            footer: {
                font: { name: 'Calibri', italic: true, size: 10, color: { argb: COLORS.lightText } },
                alignment: { horizontal: 'center', vertical: 'middle' },
                border: { top: { style: 'thin', color: { argb: COLORS.primary } } }
            }
        };

        // Logo o placeholder
        try {
            const logoId = workbook.addImage({
                filename: "logo.png",
                extension: "png",
            });
            sheet1.addImage(logoId, {
                tl: { col: 0, row: 0 },
                br: { col: 1, row: 3 },
                editAs: 'oneCell'
            });
        } catch (error) {
            console.log("Logo no disponible:", error.message);
            sheet1.mergeCells("A1:A3");
            const placeholderCell = sheet1.getCell("A1");
            placeholderCell.value = "BAPROSA";
            placeholderCell.style = {
                font: { name: 'Arial', bold: true, size: 18, color: { argb: COLORS.primary } },
                alignment: { horizontal: 'center', vertical: 'middle' },
                border: { outline: { style: 'medium', color: { argb: COLORS.primary } } }
            };
        }

        // Encabezado del reporte
        sheet1.mergeCells("B1:L1");
        const titleCell = sheet1.getCell("B1");
        titleCell.value = "BAPROSA - Sistema de Gestión de Básculas";
        Object.assign(titleCell.style, styles.title);
        
        sheet1.mergeCells("B2:L2");
        const subtitleCell = sheet1.getCell("B2");
        subtitleCell.value = "RESUMEN BFH - IMPORTACIONES DE GRANZA";
        Object.assign(subtitleCell.style, styles.subtitle);
        
        sheet1.mergeCells("B3:L3");
        const dateCell = sheet1.getCell("B3");
        const now = new Date();
        dateCell.value = `Generado el: ${now.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}`;
        Object.assign(dateCell.style, styles.dateInfo);

        // Espacio antes de las tablas
        sheet1.addRow([]);
        
        // ===== TÍTULOS DE SECCIONES LADO A LADO =====
        const sectionTitlesRow = sheet1.addRow([]);
        const currentRow = sheet1.rowCount;
        
        // Título de la primera sección (columnas A-F)
        sheet1.mergeCells(`A${currentRow}:F${currentRow}`);
        const summarySection = sheet1.getCell(`A${currentRow}`);
        summarySection.value = "RESUMEN POR FECHAS";
        Object.assign(summarySection.style, styles.sectionTitle);
        
        // Título de la segunda sección (columnas H-L)
        sheet1.mergeCells(`H${currentRow}:L${currentRow}`);
        const detailsSection = sheet1.getCell(`H${currentRow}`);
        detailsSection.value = "DETALLES POR VIAJE";
        Object.assign(detailsSection.style, styles.sectionTitle);
        
        sheet1.addRow([]);
        
        // ===== ENCABEZADOS DE COLUMNAS LADO A LADO =====
        const headersRow = sheet1.addRow([]);
        const headerRowNum = sheet1.rowCount;
        
        // Encabezados de la primera tabla (columnas A-F)
        const headers1 = ['Socio', 'Fecha', 'Total', 'Peso Neto', 'Peso Teórico', 'Desviación'];
        headers1.forEach((header, index) => {
            const cell = sheet1.getCell(headerRowNum, index + 1);
            cell.value = header;
            Object.assign(cell.style, styles.header);
        });
        
        // Encabezados de la segunda tabla (columnas H-L)
        const headers2 = ['N° Viaje', 'Peso Teórico', 'Peso Neto', 'Desviación', 'Bodega Puerto'];
        headers2.forEach((header, index) => {
            const cell = sheet1.getCell(headerRowNum, index + 8); // Columna H = 8
            cell.value = header;
            Object.assign(cell.style, styles.header);
        });
        
        headersRow.height = 30;
        
        // Configuración de anchos de columna
        const columnWidths = [30, 15, 10, 20, 20, 20, 5, 20, 20, 20, 20, 25]; // Incluye columna G como separador
        columnWidths.forEach((width, i) => {
            sheet1.getColumn(i + 1).width = width;
        });

        // ===== CALCULAR TOTALES ANTES DE MOSTRAR LOS DATOS =====
        let totalRecords = 0;
        let totalPesoNeto = 0;
        let totalPesoTeorico = 0;
        let totalDesviacion = 0;
        
        let detailTotalPesoNeto = 0;
        let detailTotalPesoTeorico = 0;
        let detailTotalDesviacion = 0;

        // Calcular totales de la primera tabla
        result.forEach(item => {
            if (typeof item.total === 'number') {
                totalRecords += item.total;
                totalPesoNeto += item.pesoNeto;
                totalPesoTeorico += item.pesoTeorico;
                totalDesviacion += item.desviacion;
            }
        });

        // Calcular totales de la segunda tabla
        buqueDetalles.forEach(item => {
            if (typeof item.pesoNeto === 'number') {
                detailTotalPesoNeto += item.pesoNeto;
                detailTotalPesoTeorico += item.pesoTeorico;
                detailTotalDesviacion += item.desviacion;
            }
        });

        // ===== PRIMERA TABLA: RESUMEN POR FECHAS =====
        // Llenar datos de la primera tabla
        for (let i = 0; i < result.length; i++) {
            const item = result[i];
            const dataRow = sheet1.addRow([]);
            const currentRowNum = sheet1.rowCount;
            dataRow.height = 15;
            
            // Llenar datos en columnas A-F
            [item.socio, item.fecha, item.total, item.pesoNeto, item.pesoTeorico, item.desviacion].forEach((value, colIndex) => {
                const cell = sheet1.getCell(currentRowNum, colIndex + 1);
                cell.value = value;
                
                // Aplicar estilo alternado
                if (i % 2 !== 0) {
                    cell.style = {...styles.data, ...styles.alternateRow};
                } else {
                    Object.assign(cell.style, styles.data);
                }
            });
            
            // Formato para valores numéricos
            if (typeof item.pesoNeto === 'number') {
                const pesoNetoCell = sheet1.getCell(currentRowNum, 4);
                pesoNetoCell.numFmt = '#,##0.00 "lb"';
                pesoNetoCell.alignment = { horizontal: 'right', vertical: 'middle' };

                const pesoTeoricoCell = sheet1.getCell(currentRowNum, 5);
                pesoTeoricoCell.numFmt = '#,##0.00 "lb"';
                pesoTeoricoCell.alignment = { horizontal: 'right', vertical: 'middle' };

                const desviacionCell = sheet1.getCell(currentRowNum, 6);
                desviacionCell.numFmt = '#,##0.00 "lb"';
                desviacionCell.alignment = { horizontal: 'right', vertical: 'middle' };
                
                // Colorear desviación según su valor
                if (item.desviacion > -100 && item.desviacion < 100) {
                    desviacionCell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.success } };
                } else {
                    desviacionCell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.danger } };
                }
            }
            
            // Centrar columnas específicas
            sheet1.getCell(currentRowNum, 2).alignment = { horizontal: 'center', vertical: 'middle' }; // Fecha
            sheet1.getCell(currentRowNum, 3).alignment = { horizontal: 'center', vertical: 'middle' }; // Total
        }

        // ===== TOTALES DE LA PRIMERA TABLA =====
        if (typeof result[0]?.total === 'number') {
            const totalsRow1 = sheet1.addRow([]);
            const totalsRowNum1 = sheet1.rowCount;
            
            ['', 'TOTALES:', totalRecords, totalPesoNeto.toFixed(2), totalPesoTeorico.toFixed(2), totalDesviacion.toFixed(2)].forEach((value, colIndex) => {
                const cell = sheet1.getCell(totalsRowNum1, colIndex + 1);
                cell.value = value;
                
                if (colIndex === 1) {
                    cell.style = styles.summary;
                } else if (colIndex > 1) {
                    cell.style = styles.summaryValue;
                }
            });
        }

        // ===== POSICIONAR LA SEGUNDA TABLA =====
        // Volver al inicio para la segunda tabla (columnas H-L)
        let currentRowForTable2 = headerRowNum + 1; // Empezar después del encabezado
        
        // ===== SEGUNDA TABLA: DETALLES POR VIAJE =====
        // Llenar datos de la segunda tabla
        for (let i = 0; i < buqueDetalles.length; i++) {
            const item = buqueDetalles[i];
            
            // Llenar datos en columnas H-L
            [item.Nviajes, item.pesoTeorico, item.pesoNeto, item.desviacion, item.bodegaPuerto].forEach((value, colIndex) => {
                const cell = sheet1.getCell(currentRowForTable2, colIndex + 8); // Columna H = 8
                cell.value = value;
                
                // Aplicar estilo alternado
                if (i % 2 !== 0) {
                    cell.style = {...styles.data, ...styles.alternateRow};
                } else {
                    Object.assign(cell.style, styles.data);
                }
            });
            
            // Formato para valores numéricos
            if (typeof item.pesoNeto === 'number') {
                const pesoNetoCell = sheet1.getCell(currentRowForTable2, 10);
                pesoNetoCell.numFmt = '#,##0.00 "lb"';
                pesoNetoCell.alignment = { horizontal: 'right', vertical: 'middle' };

                const pesoTeoricoCell = sheet1.getCell(currentRowForTable2, 9);
                pesoTeoricoCell.numFmt = '#,##0.00 "lb"';
                pesoTeoricoCell.alignment = { horizontal: 'right', vertical: 'middle' };

                const desviacionCell = sheet1.getCell(currentRowForTable2, 11);
                desviacionCell.numFmt = '#,##0.00 "lb"';
                desviacionCell.alignment = { horizontal: 'right', vertical: 'middle' };
                
                // Colorear desviación según su valor
                if (item.desviacion < -200) {
                    desviacionCell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.danger } }; // Rojo fuerte
                } else if (item.desviacion < 0) {
                    desviacionCell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.warning } }; // Amarillo
                } else {
                    desviacionCell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.success } }; // Verde
                }

            }
            
            // Centrar columnas específicas
            sheet1.getCell(currentRowForTable2, 8).alignment = { horizontal: 'center', vertical: 'middle' }; // N° Viaje
            sheet1.getCell(currentRowForTable2, 12).alignment = { horizontal: 'center', vertical: 'middle' }; // Bodega Puerto
            
            currentRowForTable2++;
        }

        // ===== TOTALES DE LA SEGUNDA TABLA =====
        if (typeof buqueDetalles[0]?.pesoNeto === 'number') {
            ['TOTALES:', detailTotalPesoTeorico.toFixed(2), detailTotalPesoNeto.toFixed(2), detailTotalDesviacion.toFixed(2), ''].forEach((value, colIndex) => {
                const cell = sheet1.getCell(currentRowForTable2, colIndex + 8);
                cell.value = value;
                
                if (colIndex === 0) {
                    cell.style = styles.summary;
                } else if (colIndex > 0 && colIndex < 4) {
                    cell.style = styles.summaryValue;
                }
            });
        }

        // Pie de página
        sheet1.addRow([]);
        sheet1.addRow([]);
        const footerRow = sheet1.rowCount + 1;
        sheet1.mergeCells(`A${footerRow}:L${footerRow}`);
        const footerCell = sheet1.getCell(`A${footerRow}`);
        footerCell.value = 'BAPROSA - Sistema de Gestión de Básculas © ' + new Date().getFullYear();
        Object.assign(footerCell.style, styles.footer);

        // ===== HOJA 2: DETALLES COMPLETOS =====
        const sheet2 = workbook.addWorksheet('Detalles', {
            pageSetup: {
                paperSize: 9, // A4
                orientation: 'landscape',
                fitToPage: true,
                fitToWidth: 1,
                fitToHeight: 0,
                margins: {
                    top: 0.7,
                    left: 0.7,
                    bottom: 0.7,
                    right: 0.7,
                    header: 0.3,
                    footer: 0.3
                }
            },
            properties: { 
                tabColor: {argb: COLORS.secondary} 
            }
        });
        
        // Encabezado de la hoja de detalles
        sheet2.mergeCells("A1:AC1");
        const detailsTitle = sheet2.getCell("A1");
        detailsTitle.value = "DETALLES COMPLETOS BFH - IMPORTACIONES DE GRANZA";
        detailsTitle.style = {
            font: { name: 'Calibri', bold: true, size: 16, color: { argb: COLORS.primary } },
            alignment: { horizontal: 'center', vertical: 'middle' },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.light } },
            border: { outline: { style: 'thin', color: { argb: COLORS.primary } } }
        };
        
        // Fecha de generación
        sheet2.mergeCells("A2:AC2");
        const detailsDateCell = sheet2.getCell("A2");
        detailsDateCell.value = `Generado el: ${now.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}`;
        Object.assign(detailsDateCell.style, styles.dateInfo);
        
        sheet2.addRow([]);
        
        // Encabezados de la tabla de detalles completos
        const detailHeaders = [
            'Factura', 'Num. Boleta', 'N° Viaje', 'N° Salida', 'Socio', 'Placa', 'Empresa',
            'Tara (lb)', 'Peso Bruto (lb)', 'Peso Neto (lb)', 'Peso Neto (qq)', 'Peso Neto (ton)',
            'Peso Teórico (lb)', 'Peso Teórico (qq)', 'Peso Teórico (ton)',
            'Desviación (lb)', 'Desviación (qq)', 'Desviación (ton)',
            'Sello 1', 'Sello 2', 'Sello 3', 'Sello 4', 'Sello 5', 'Sello 6',
            'Tolva Asignada', 'Silo Principal', 'Silo Secundario', 'Silo Terciario'
        ];
        
        const detailHeadersRow = sheet2.addRow(detailHeaders);
        detailHeadersRow.height = 25;
        
        // Aplicar estilo a los encabezados
        detailHeaders.forEach((header, index) => {
            const cell = sheet2.getCell(sheet2.rowCount, index + 1);
            Object.assign(cell.style, styles.header);
        });
        
        // Configurar anchos de columna para la hoja de detalles
        const detailColumnWidths = [8, 12, 10, 10, 25, 12, 20, 12, 15, 15, 12, 12, 15, 12, 12, 12, 12, 12, 10, 10, 10, 10, 10, 10, 15, 20, 20, 20];
        detailColumnWidths.forEach((width, i) => {
            sheet2.getColumn(i + 1).width = width;
        });
        
        // Llenar datos de detalles completos
        let detailTotals = {
            pesoNeto: 0,
            pesoNetoQuintales: 0,
            pesoNetoToneladas: 0,
            pesoTeorico: 0,
            pesoTeoricoQuintales: 0,
            pesoTeoricoToneladas: 0,
            desviacion: 0,
            desviacionQuintales: 0,
            desviacionToneladas: 0
        };
        
        for (let i = 0; i < detallesCompletos.length; i++) {
            const item = detallesCompletos[i];
            const dataRow = sheet2.addRow([]);
            const currentRowNum = sheet2.rowCount;
            dataRow.height = 20;
            
            // Datos de la fila
            const rowData = [
                Number(item.factura),
                item.numBoleta,
                item.Nviajes,
                item.NSalida,
                item.socio,
                item.placa,
                item.empresa,
                item.Tara,
                item.PesoBruto,
                item.pesoNeto,
                item.PesoNetoQuintales,
                item.PesoNetoToneladas,
                item.pesoTeorico,
                item.PesoTeoricoQuintales,
                item.PesoTeoricoToneladas,
                item.desviacion,
                item.DesviacionEnQuintales,
                item.DesviacionEnTonelada,
                item.sello1,
                item.sello2,
                item.sello3,
                item.sello4,
                item.sello5,
                item.sello6,
                item.tolvaAsignada,
                item.siloPrincipal,
                item.siloSecundario,
                item.siloTerciario
            ];
            
            // Llenar datos en las celdas
            rowData.forEach((value, colIndex) => {
                const cell = sheet2.getCell(currentRowNum, colIndex + 1);
                cell.value = value;
                
                // Aplicar estilo alternado
                if (i % 2 !== 0) {
                    cell.style = {...styles.data, ...styles.alternateRow};
                } else {
                    Object.assign(cell.style, styles.data);
                }
            });
            
            // Aplicar formatos específicos y alineaciones
            // Centrar columnas numéricas específicas
            [1, 2, 3, 4].forEach(col => {
                sheet2.getCell(currentRowNum, col).alignment = { horizontal: 'center', vertical: 'middle' };
            });
            
            // Formato para pesos en libras
            [8, 9, 10, 13, 16].forEach(col => {
                const cell = sheet2.getCell(currentRowNum, col);
                if (typeof cell.value === 'number') {
                    cell.numFmt = '#,##0.00 "lb"';
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                }
            });
            
            // Formato para quintales
            [11, 14, 17].forEach(col => {
                const cell = sheet2.getCell(currentRowNum, col);
                if (typeof cell.value === 'number') {
                    cell.numFmt = '#,##0.00 "qq"';
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                }
            });
            
            // Formato para toneladas
            [12, 15, 18].forEach(col => {
                const cell = sheet2.getCell(currentRowNum, col);
                if (typeof cell.value === 'number') {
                    cell.numFmt = '#,##0.000 "ton"';
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                }
            });
            
            // Colorear desviación según su valor (columnas 16, 17, 18)
            [16, 17, 18].forEach(col => {
                const cell = sheet2.getCell(currentRowNum, col);
                if (typeof cell.value === 'number') {
                    if (cell.value < -200 || (col === 17 && cell.value < -2) || (col === 18 && cell.value < -0.09)) {
                        cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.danger } };
                    } else if (cell.value < 0) {
                        cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.warning } };
                    } else {
                        cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.success } };
                    }
                }
            });
            
            // Centrar sellos y tolva
            [19, 20, 21, 22, 23, 24, 25].forEach(col => {
                sheet2.getCell(currentRowNum, col).alignment = { horizontal: 'center', vertical: 'middle' };
            });
            
            // Acumular totales
            if (typeof item.pesoNeto === 'number') {
                detailTotals.pesoNeto += item.pesoNeto;
                detailTotals.pesoNetoQuintales += item.PesoNetoQuintales;
                detailTotals.pesoNetoToneladas += item.PesoNetoToneladas;
                detailTotals.pesoTeorico += item.pesoTeorico;
                detailTotals.pesoTeoricoQuintales += item.PesoTeoricoQuintales;
                detailTotals.pesoTeoricoToneladas += item.PesoTeoricoToneladas;
                detailTotals.desviacion += item.desviacion;
                detailTotals.desviacionQuintales += item.DesviacionEnQuintales;
                detailTotals.desviacionToneladas += item.DesviacionEnTonelada;
            }
        }
        
        // Agregar fila de totales para la hoja de detalles
        if (detallesCompletos.length > 0) {
            sheet2.addRow([]); // Fila vacía
            
            const totalsRow = sheet2.addRow([]);
            const totalsRowNum = sheet2.rowCount;
            
            const totalsData = [
                '', '', '', '', '', '', 'TOTALES:',
                '', '', 
                detailTotals.pesoNeto,
                detailTotals.pesoNetoQuintales, 
                detailTotals.pesoNetoToneladas,
                detailTotals.pesoTeorico,
                detailTotals.pesoTeoricoQuintales,
                detailTotals.pesoTeoricoToneladas,
                detailTotals.desviacion,
                detailTotals.desviacionQuintales,
                detailTotals.desviacionToneladas,
                '', '', '', '', '', '', '', '', '', ''
            ];
            
            totalsData.forEach((value, colIndex) => {
                const cell = sheet2.getCell(totalsRowNum, colIndex + 1);
                cell.value = value;
                
                if (colIndex === 6) {
                    cell.style = styles.summary;
                } else if (colIndex >= 9 && colIndex <= 17 && value !== '') {
                    cell.style = styles.summaryValue;
                    
                    // Aplicar formatos a los totales
                    if (colIndex === 9 || colIndex === 12 || colIndex === 15) {
                        cell.numFmt = '#,##0.00';
                    } else if (colIndex === 10 || colIndex === 13 || colIndex === 16) {
                        cell.numFmt = '#,##0.00';
                    } else if (colIndex === 11 || colIndex === 14 || colIndex === 17) {
                        cell.numFmt = '#,##0.000';
                    }
                }
            });
        }

        // ===== HOJA 3: GRÁFICOS (EN BLANCO) =====
        const sheet3 = workbook.addWorksheet('Placas', {
            properties: { tabColor: {argb: COLORS.accent} }
        });
        
        sheet3.mergeCells("A1:F1");
        const chartsTitle = sheet3.getCell("A1");
        chartsTitle.value = "PLACAS";
        chartsTitle.style = {
            font: { name: 'Calibri', bold: true, size: 16, color: { argb: COLORS.primary } },
            alignment: { horizontal: 'center', vertical: 'middle' },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.light } },
            border: { outline: { style: 'thin', color: { argb: COLORS.primary } } }
        };
        
        sheet3.getRow(3).values = ['En desarrollo'];
        sheet3.getCell('A3').style = {
            font: { name: 'Calibri', italic: true, size: 12, color: { argb: COLORS.lightText } },
            alignment: { horizontal: 'left', vertical: 'middle' }
        };
        
        // Configurar anchos de columna
        for (let i = 1; i <= 6; i++) {
            sheet3.getColumn(i).width = 20;
        }

        // ===== HOJA 4: NOTAS (EN BLANCO) =====
        const sheet4 = workbook.addWorksheet('Totales', {
            properties: { tabColor: {argb: COLORS.warning} }
        });
        
        sheet4.mergeCells("A1:F1");
        const notesTitle = sheet4.getCell("A1");
        notesTitle.value = "TOTALES";
        notesTitle.style = {
            font: { name: 'Calibri', bold: true, size: 16, color: { argb: COLORS.primary } },
            alignment: { horizontal: 'center', vertical: 'middle' },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.light } },
            border: { outline: { style: 'thin', color: { argb: COLORS.primary } } }
        };
        
        sheet4.getRow(3).values = ['Desarrollo en curso...'];
        sheet4.getCell('A3').style = {
            font: { name: 'Calibri', italic: true, size: 12, color: { argb: COLORS.lightText } },
            alignment: { horizontal: 'left', vertical: 'middle' }
        };
        
        // Configurar anchos de columna
        for (let i = 1; i <= 6; i++) {
            sheet4.getColumn(i).width = 20;
        }

        // Configurar la respuesta para descargar el archivo Excel
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="resumen_bfh_${new Date().toISOString().split('T')[0]}.xlsx"`);
        
        // Escribir el archivo Excel a la respuesta
        await workbook.xlsx.write(res);
        res.end();
        
    } catch(err) {
        console.log(err);
        res.status(500).send({ error: 'Error interno del servidor' });
    }
}

module.exports = {
    buquesBoletas, 
    getResumenBFH,
    getBuqueDetalles, 
    getBuqueStats,
    exportR1Importaciones, 
    getInformePagoAtrasnporte, 
}