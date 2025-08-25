const db = require("../lib/prisma");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { QUINTALTONELADA, GRANZA, IMPORTACIONES } = require("../utils/variablesInformes");
const ExcelJS = require('exceljs');
const { CONFIGPAGE, COLORS, styles } = require("../lib/configExcel");

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
            
            const key = `${item.socio}-${fechaLocal}`;
            
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
                Nviajes: true,
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
        const PAGO_POR_VIAJE = parseInt(req.query.tarifa) || 317.4;
        const PAGO_DOLAR_COMPRA = parseFloat(req.query.tasaCompraDolar) || 26.0430;
        const PAGO_DOLAR_VENTA = parseFloat(req.query.tasaVentaDolar) || 26.1732;
        const COSTE_DEL_QUINTAL = parseInt(req.query.costeQuintal) || 545;

        const ID_MOVIMIENTO = 2;

        if (!buque || isNaN(buque)) {
            return res.status(400).json({ 
                error: 'Parámetro buque requerido y debe ser un número válido' 
            });
        }

        const [silos, pagos, statsBaprosa, primeraUnidad, ultimaUnidad, empresasCobro] = await Promise.all([
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
                ORDER BY nombre asc
            `,

            db.boleta.groupBy({
                by: ['empresa'],
                where: {
                    idMovimiento: ID_MOVIMIENTO,
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
            }), 
            
            db.boleta.findMany({
                select: {
                    id: true,
                    fechaInicio: true,
                }, 
                where: {
                    idSocio: buque,
                    factura: factura,
                }, 
                orderBy:{
                    id: 'asc', 
                }, 
                take: 1,   
            }), 
            db.boleta.findMany({
                select: {
                    id: true,
                    fechaInicio: true,
                }, 
                where: {
                    idSocio: buque,
                    factura: factura,
                }, 
                orderBy:{
                    id: 'desc', 
                }, 
                take: 1,   
            }),
            db.boleta.findMany({
                where: {
                    idSocio: buque,
                    desviacion: { lt: -199 }
                }
            }) 
        ]);

        const boletasPorEmpresa = empresasCobro.reduce((acc, boleta) => {
            const empresa = boleta.empresa; // campo directo
            if (!acc[empresa]) {
                acc[empresa] = [];
            }
            acc[empresa].push(boleta);
            return acc;
        }, {});

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
            tasaAplicada: item.empresa === 'Transportes Esher' ? PAGO_DOLAR_COMPRA : PAGO_DOLAR_VENTA, 
            pagosLempiras: item.empresa === 'Transportes Esher' ? item._count._all * PAGO_DOLAR_COMPRA * PAGO_POR_VIAJE : item._count._all * PAGO_DOLAR_VENTA * PAGO_POR_VIAJE,
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

        // Creación del libro de trabajo Excel
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'BAPROSA';
        workbook.lastModifiedBy = 'Sistema de Básculas';
        workbook.created = new Date();
        workbook.modified = new Date();

        // ===== HOJA 1: PAGO DE TRANSPORTES E INGRESO BAPROSA =====
        const sheet1 = workbook.addWorksheet("Pago Transportes e Ingreso", CONFIGPAGE);

        // Logo o placeholder
        try {
            const logoId = workbook.addImage({
                filename: "logo.png",
                extension: "png",
            });
            sheet1.addImage(logoId, {
                tl: { col: 4, row: 0 },
                br: { col: 6, row: 3 },
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
        sheet1.mergeCells("A1:D1");
        const titleCell = sheet1.getCell("A1");
        titleCell.value = "BENEFICIO DE ARROZ PROGRESO, S.A. DE C.V.";
        Object.assign(titleCell.style, styles.title);
        
        sheet1.mergeCells("A2:E2");
        const subtitleCell = sheet1.getCell("A2");
        subtitleCell.value = `IMPORTACIÓN ${ingresoBaprosa[0].socio.toUpperCase()} `;
        Object.assign(subtitleCell.style, styles.subtitle);

        // Información de la factura
        sheet1.mergeCells("A3:E3");
        const productCell = sheet1.getCell("A3");
        productCell.value = `GRANZA AMERICANA`;
        Object.assign(productCell.style, styles.dateInfo);

        // Información de la factura
        sheet1.mergeCells("A4:E4");
        const proveedorCell = sheet1.getCell("A4");
        proveedorCell.value = `Proveedor: ${dataFactura?.Proveedor || 'N/A'}`;
        Object.assign(proveedorCell.style, styles.dateInfo);

        // Información de la factura
        sheet1.mergeCells("A5:E5");
        const infoCell = sheet1.getCell("A5");
        infoCell.value = `Factura: ${factura || 'N/A'}`;
        Object.assign(infoCell.style, styles.dateInfo);

        sheet1.mergeCells("A6:E6");
        const buqueCell = sheet1.getCell("A6");
        buqueCell.value = `Buque: ${ingresoBaprosa[0].socio.toUpperCase()} `;
        Object.assign(buqueCell.style, styles.dateInfo  );

        sheet1.mergeCells("A7:E7");
        const transportesUsados = sheet1.getCell("A7");
        transportesUsados.value = `Buque: ${pagos.map(item => item.empresa).join(', ').toUpperCase()} `;
        Object.assign(transportesUsados.style, styles.dateInfo  );

        sheet1.mergeCells("A8:E8");
        const fechasDeInicioYfin = sheet1.getCell("A8");
        fechasDeInicioYfin.value = `Inicio: ${new Date(primeraUnidad[0].fechaInicio).toLocaleString()} - Fin: ${new Date(ultimaUnidad[0].fechaInicio).toLocaleString()}`;
        Object.assign(fechasDeInicioYfin.style, styles.dateInfo  );
        
        const now = new Date();
        sheet1.mergeCells("A9:E9");
        const dateCell = sheet1.getCell("A9");
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

        // ===== SECCIÓN 1: PAGO DE TRANSPORTES =====
        const transporteRow = sheet1.addRow([]);
        sheet1.mergeCells(`A${sheet1.rowCount}:F${sheet1.rowCount}`);
        const transporteTitle = sheet1.getCell(`A${sheet1.rowCount}`);
        transporteTitle.value = "PAGO DE TRANSPORTES";
        Object.assign(transporteTitle.style, styles.sectionTitle);
        
        sheet1.addRow([]);
        
        // Encabezados de pago de transportes
        const transporteHeaders = sheet1.addRow(['Empresa', 'Total Viajes', 'Pago USD', 'Peso Neto (qq)', 'Peso Teórico (qq)', 'Desviación (qq)']);
        transporteHeaders.height = 25;
        
        // Aplicar estilos a encabezados de transporte
        ['Empresa', 'Total Viajes', 'Pago USD', 'Peso Neto (qq)', 'Peso Teórico (qq)', 'Desviación (qq)'].forEach((header, index) => {
            const cell = sheet1.getCell(sheet1.rowCount, index + 1);
            Object.assign(cell.style, styles.header);
        });
        
        // Datos de transportes
        let totalViajesTransporte = 0;
        let totalPagosUSD = 0;
        let totalPesoNetoTransporte = 0;
        let totalPesoTeoricoTransporte = 0;
        let totalDesviacionTransporte = 0;

        pagoTransportes.forEach((pago, i) => {
            const dataRow = sheet1.addRow([]);
            dataRow.height = 20;
            
            totalViajesTransporte += pago.totalViajes;
            totalPagosUSD += pago.pagosDolares;
            totalPesoNetoTransporte += pago.pesoNetoQQ;
            totalPesoTeoricoTransporte += pago.pesoTeoricoQQ;
            totalDesviacionTransporte += pago.desviacionQQ;
            
            const transporteData = [pago.socio, pago.totalViajes, pago.pagosDolares, pago.pesoNetoQQ, pago.pesoTeoricoQQ, pago.desviacionQQ];
            transporteData.forEach((value, colIndex) => {
                const cell = sheet1.getCell(sheet1.rowCount, colIndex + 1);
                cell.value = value;
                
                if (i % 2 !== 0) {
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
                            if (value >= 0) {
                                cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.success } };
                            } else {
                                cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.danger } };
                            }
                        }
                    }
                }
            });
        });
        
        
        // Totales de transportes
        const totalsTransporteRow = sheet1.addRow(['TOTALES:', totalViajesTransporte, totalPagosUSD, totalPesoNetoTransporte, totalPesoTeoricoTransporte, totalDesviacionTransporte]);
        totalsTransporteRow.eachCell((cell, colIndex) => {
            if (colIndex === 1) {
                Object.assign(cell.style, styles.summary);
            } else {
                Object.assign(cell.style, styles.summaryValue);
                if (colIndex === 3) {
                    cell.numFmt = '$#,##0.00';
                } else if (colIndex >= 4) {
                    cell.numFmt = '#,##0.00 "qq"';
                }
            }
        });

        sheet1.addRow([]);
        sheet1.addRow([]);


        // ===== TOTAL A PAGAR ======
        const transporteRow2 = sheet1.addRow([]);
        sheet1.mergeCells(`A${sheet1.rowCount}:F${sheet1.rowCount}`);
        const transporteTitle2 = sheet1.getCell(`A${sheet1.rowCount}`);
        transporteTitle2.value = "TOTAL EN LEMPIRAS";
        Object.assign(transporteTitle2.style, styles.sectionTitle);
        
        sheet1.addRow([]);

        const transporteHeaders2 = sheet1.addRow(['Empresa', 'Total Viajes', 'Pago USD', 'TASA USD','Pago LPS']);
        transporteHeaders2.height = 25;
        
        // Aplicar estilos a encabezados de transporte
        ['Empresa', 'Total Viajes', 'Pago USD', 'TASA USD', 'Pago LPS'].forEach((header, index) => {
            const cell = sheet1.getCell(sheet1.rowCount, index + 1);
            Object.assign(cell.style, styles.header);
        });
        
        let totalApagar = 0;
        
        pagoTransportes.forEach((pago, i) => {
            const dataRow = sheet1.addRow([]);
            dataRow.height = 20;
            
            totalApagar += pago.pagosLempiras;
            
            const transporteData = [pago.socio, pago.totalViajes, pago.pagosDolares, pago.tasaAplicada, pago.pagosLempiras];
            transporteData.forEach((value, colIndex) => {
                const cell = sheet1.getCell(sheet1.rowCount, colIndex + 1);
                cell.value = value;
                
                if (i % 2 !== 0) {
                    cell.style = {...styles.data, ...styles.alternateRow};
                } else {
                    Object.assign(cell.style, styles.data);
                }
                
                if (colIndex >= 1) {
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    if (colIndex === 2) {
                        cell.numFmt = '$#,##0.00';
                    } else if (colIndex >= 3) {
                        cell.numFmt = 'L#,##0.00';
                    }
                }
            });
        });
        
        
        // Totales de transportes en lempiras
        const pagosEnLempiras = sheet1.addRow(['TOTALES:', totalViajesTransporte, totalPagosUSD, '-',totalApagar]);
        pagosEnLempiras.eachCell((cell, colIndex) => {
            if (colIndex === 1) {
                Object.assign(cell.style, styles.summary);
            } else {
                Object.assign(cell.style, styles.summaryValue);
                if (colIndex === 3) {
                    cell.numFmt = '$#,##0.00';
                } else if (colIndex >= 4) {
                    cell.numFmt = 'L#,##0.00';
                }
            }
        });

        sheet1.addRow([]);
        sheet1.addRow([]);


        /* Parte Inicial */
        const empresasTitle = sheet1.addRow(['TRANSPORTES CON DESVIACIÓN']);
        sheet1.mergeCells(`A${empresasTitle.number}:F${empresasTitle.number}`);
        const empresasTitleCell = sheet1.getCell(`A${empresasTitle.number}`);
        Object.assign(empresasTitleCell.style, styles.sectionTitle);

        let totalViajes2 = 0;
        let totalPesoNeto2 = 0;
        let totalDesviacion2 = 0;

        // Objeto para almacenar desviaciones por empresa
        let desviacionesPorEmpresa = {};

        Object.entries(boletasPorEmpresa).forEach(([empresa, boletas]) => {
            // Fila de título por empresa
            const headerRow = sheet1.addRow([empresa]);
            sheet1.mergeCells(`A${headerRow.number}:F${headerRow.number}`);
            const headerCell = sheet1.getCell(`A${headerRow.number}`);
            Object.assign(headerCell.style, styles.sectionTitle);

            // Inicializar desviación para esta empresa
            let desviacionEmpresa = 0;

            // Recorres las boletas de esa empresa
            boletas.forEach((boleta, i) => {
                const dataRow = sheet1.addRow([]);
                dataRow.height = 20;

                totalViajes2 += boleta.Nviajes || 0;
                totalPesoNeto2 += boleta.pesoNeto || 0;
                totalDesviacion2 += boleta.desviacion || 0;

                // Sumar desviación de esta empresa
                desviacionEmpresa += boleta.desviacion || 0;

                // Los datos que quieres mostrar por cada boleta
                const rowData = [
                    boleta.numBoleta,
                    boleta.placa,
                    boleta.motorista,
                    boleta.Nviajes,
                    boleta.pesoNeto,
                    boleta.desviacion
                ];

                rowData.forEach((value, colIndex) => {
                    const cell = sheet1.getCell(sheet1.rowCount, colIndex + 1);
                    cell.value = value;

                    // alternar estilo filas
                    if (i % 2 !== 0) {
                        cell.style = { ...styles.data, ...styles.alternateRow };
                    } else {
                        Object.assign(cell.style, styles.data);
                    }

                    // formato numérico
                    if (colIndex >= 3) {
                        cell.alignment = { horizontal: 'right', vertical: 'middle' };
                        if (colIndex === 4) { // peso neto
                            cell.numFmt = '#,##0';
                        } else if (colIndex === 5) { // desviación
                            cell.numFmt = '#,##0';
                        }
                    }
                });
            });
            
            // Guardar la desviación total de esta empresa
            desviacionesPorEmpresa[empresa] = desviacionEmpresa;
            
            sheet1.addRow([]);
        });

        // Agregar título para la sección de costos por desviación
        const costoTitleRow = sheet1.addRow(['COBRO A TRANSPORTES']);
        sheet1.mergeCells(`A${costoTitleRow.number}:F${costoTitleRow.number}`);
        const costoTitleCell = sheet1.getCell(`A${costoTitleRow.number}`);
        Object.assign(costoTitleCell.style, styles.sectionTitle);

        // Agregar una fila vacía
        sheet1.addRow([]);

        // Calcular y agregar al Excel las desviaciones en quintales multiplicadas por 545 lps
        Object.entries(desviacionesPorEmpresa).forEach(([empresa, desviacion]) => {
            const desviacionQuintales = desviacion/100; // Ya viene en quintales
            const costoLempiras = desviacionQuintales * COSTE_DEL_QUINTAL;
            
            const costoRow = sheet1.addRow([`${empresa}: ${costoLempiras.toLocaleString()} lps`]);
            sheet1.mergeCells(`A${costoRow.number}:F${costoRow.number}`);
            
            const costoCell = sheet1.getCell(`A${costoRow.number}`);
            costoCell.style = {
                font: { bold: true, size: 12 },
                alignment: { horizontal: 'left', vertical: 'middle' },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F3FF' } }
            };
        });



        /* Parte Fin */

        // Configurar anchos de columna para hoja 1
        const columnWidths1 = [25, 15, 20, 20, 20, 20];
        columnWidths1.forEach((width, i) => {
            sheet1.getColumn(i + 1).width = width;
        });

        // Pie de página para hoja 1
        sheet1.addRow([]);
        sheet1.addRow([]);
        const footerRow1 = sheet1.rowCount + 1;
        sheet1.mergeCells(`A${footerRow1}:F${footerRow1}`);
        const footerCell1 = sheet1.getCell(`A${footerRow1}`);
        footerCell1.value = 'BENEFICIO DE ARROZ PROGRESO, S.A. DE C.V. © ' + new Date().getFullYear();
        Object.assign(footerCell1.style, styles.footer);

        // ===== HOJA 2: COMPARACIONES Y DISTRIBUCIÓN POR SILOS =====
        const sheet2 = workbook.addWorksheet("Comparaciones y Silos", CONFIGPAGE);

        // Logo o placeholder para hoja 2
        try {
            const logoId2 = workbook.addImage({
                filename: "logo.png",   
                extension: "png",
            });
            sheet2.addImage(logoId2, {
                tl: { col: 4, row: 0 },
                br: { col: 6, row: 3 },
                editAs: 'oneCell'
            });
        } catch (error) {
            sheet2.mergeCells("A1:A3");
            const placeholderCell2 = sheet2.getCell("A1");
            placeholderCell2.value = "BAPROSA";
            placeholderCell2.style = {
                font: { name: 'Arial', bold: true, size: 18, color: { argb: COLORS.primary } },
                alignment: { horizontal: 'center', vertical: 'middle' },
                border: { outline: { style: 'medium', color: { argb: COLORS.primary } } }
            };
        }

        // Encabezado del reporte
        sheet2.mergeCells("A1:D1");
        const titleCell2 = sheet2.getCell("A1");
        titleCell2.value = "BENEFICIO DE ARROZ PROGRESO, S.A. DE C.V.";
        Object.assign(titleCell2.style, styles.title);
        
        sheet2.mergeCells("A2:E2");
        const subtitleCell2 = sheet2.getCell("A2");
        subtitleCell2.value = `IMPORTACIÓN ${ingresoBaprosa[0].socio.toUpperCase()} `;
        Object.assign(subtitleCell2.style, styles.subtitle);

        // Información de la factura
        sheet2.mergeCells("A3:E3");
        const productCell2 = sheet2.getCell("A3");
        productCell2.value = `GRANZA AMERICANA`;
        Object.assign(productCell2.style, styles.dateInfo);

        // Información de la factura
        sheet2.mergeCells("A4:E4");
        const proveedorCell2 = sheet2.getCell("A4");
        proveedorCell2.value = `Proveedor: ${dataFactura?.Proveedor || 'N/A'}`;
        Object.assign(proveedorCell2.style, styles.dateInfo);

        // Información de la factura
        sheet2.mergeCells("A5:E5");
        const infoCell2 = sheet2.getCell("A5");
        infoCell2.value = `Factura: ${factura || 'N/A'}`;
        Object.assign(infoCell2.style, styles.dateInfo);

        sheet2.mergeCells("A6:E6");
        const buqueCell2 = sheet2.getCell("A6");
        buqueCell2.value = `Buque: ${ingresoBaprosa[0].socio.toUpperCase()} `;
        Object.assign(buqueCell2.style, styles.dateInfo  );

        sheet2.mergeCells("A7:E7");
        const transportesUsados2 = sheet2.getCell("A7");
        transportesUsados2.value = `Buque: ${pagos.map(item => item.empresa).join(', ').toUpperCase()} `;
        Object.assign(transportesUsados2.style, styles.dateInfo  );

        sheet2.mergeCells("A8:E8");
        const fechasDeInicioYfin2 = sheet2.getCell("A8");
        fechasDeInicioYfin2.value = `Inicio: ${new Date(primeraUnidad[0].fechaInicio).toLocaleString()} - Fin: ${new Date(ultimaUnidad[0].fechaInicio).toLocaleString()}`;
        Object.assign(fechasDeInicioYfin2.style, styles.dateInfo  );
        
        sheet2.mergeCells("A9:E9");
        const dateCell2 = sheet2.getCell("A9");
        dateCell2.value = `Generado el: ${now.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}`;
        Object.assign(dateCell2.style, styles.dateInfo);

        sheet2.addRow([]);
        sheet2.addRow([]);

        // ===== SECCIÓN 2: INGRESO BAPROSA =====
        const baprosaTitleRow = sheet2.addRow([]);
        sheet2.mergeCells(`A${sheet2.rowCount}:E${sheet2.rowCount}`);
        const baprosaTitle = sheet2.getCell(`A${sheet2.rowCount}`);
        baprosaTitle.value = "INGRESO BAPROSA BASCULA - PUERTO(TEH)";
        Object.assign(baprosaTitle.style, styles.sectionTitle);
        
        sheet2.addRow([]);
        
        // Encabezados de INGRESO BAPROSA
        const baprosHeaders = sheet2.addRow(['Socio', 'Total Viajes', 'Peso Neto (qq)', 'Peso Teórico (qq)', 'Desviación (qq)']);
        baprosHeaders.height = 25;
        
        ['Socio', 'Total Viajes', 'Peso Neto (qq)', 'Peso Teórico (qq)', 'Desviación (qq)'].forEach((header, index) => {
            const cell = sheet2.getCell(sheet2.rowCount, index + 1);
            Object.assign(cell.style, styles.header);
        });

        // Datos de INGRESO BAPROSA
        ingresoBaprosa.forEach((ingreso, i) => {
            const dataRow = sheet2.addRow([]);
            dataRow.height = 20;
            
            const baprosData = [ingreso.socio, ingreso.totalViajes, ingreso.pesoNetoQQ, ingreso.pesoTeoricoQQ, ingreso.desviacionQQ];
            
            baprosData.forEach((value, colIndex) => {
                const cell = sheet2.getCell(sheet2.rowCount, colIndex + 1);
                cell.value = value;
                
                if (i % 2 !== 0) {
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
                            if (value >= 0) {
                                cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.success } };
                            } else {
                                cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.danger } };
                            }
                        }
                    }
                }
            });
        });

        sheet2.addRow([]);
        sheet2.addRow([]);

        // ===== SECCIÓN 1: COMPARACIÓN FACTURA VS BÁSCULA =====
        const comparacionRow = sheet2.addRow([]);
        sheet2.mergeCells(`A${sheet2.rowCount}:F${sheet2.rowCount}`);
        const comparacionTitle = sheet2.getCell(`A${sheet2.rowCount}`);
        comparacionTitle.value = "COMPARACIÓN FACTURA VS BÁSCULA";
        Object.assign(comparacionTitle.style, styles.sectionTitle);
        
        sheet2.addRow([]);

        // BÁSCULA TEH/LOGRA
        sheet2.mergeCells(`A${sheet2.rowCount}:F${sheet2.rowCount}`);
        const tehTitle = sheet2.getCell(`A${sheet2.rowCount}`);
        tehTitle.value = "BÁSCULA TEH/LOGRA";
        Object.assign(tehTitle.style, {
            font: { name: 'Calibri', bold: true, size: 12, color: { argb: COLORS.primary } },
            alignment: { horizontal: 'center', vertical: 'middle' },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.gray } },
            border: { outline: { style: 'thin', color: { argb: COLORS.primary } } }
        });

        sheet2.addRow([]);

        // Headers para TEH/LOGRA
        const tehHeadersRow = sheet2.addRow(['Descripción', 'QQ', 'TM', '', '', '']);
        tehHeadersRow.eachCell((cell, colIndex) => {
            if (colIndex <= 3) {
                Object.assign(cell.style, styles.header);
            }
        });

        // Datos TEH/LOGRA
        const tehData = [
            ['Según factura', dataFactura?.Cantidad ? (dataFactura.Cantidad * 22.0462262).toFixed(2) : null, dataFactura?.Cantidad ? dataFactura.Cantidad.toFixed(2) : null],
            ['Enviados', (statsBaprosa[0]._sum.pesoTeorico / LB_TO_QQ).toFixed(2), ((statsBaprosa[0]._sum.pesoTeorico / LB_TO_QQ) / 22.0462262).toFixed(2)],
            [`${(statsBaprosa[0]._sum.pesoTeorico / LB_TO_QQ) - (dataFactura.Cantidad * 22.0462262) >=0 ? 'Sobrante' : 'Faltante'}`, 
             dataFactura?.Cantidad ? ((statsBaprosa[0]._sum.pesoTeorico / LB_TO_QQ) - (dataFactura.Cantidad * 22.0462262)).toFixed(2) : null,
             dataFactura?.Cantidad ? (((statsBaprosa[0]._sum.pesoTeorico / LB_TO_QQ) / 22.0462262) - dataFactura.Cantidad).toFixed(2) : null
            ]
        ];

        tehData.forEach((rowData, i) => {
            const dataRow = sheet2.addRow([rowData[0], rowData[1], rowData[2], '', '', '']);
            dataRow.height = 20;
            
            dataRow.eachCell((cell, colIndex) => {
                if (colIndex <= 3) {
                    if (colIndex === 1) { // Etiqueta
                        cell.style = {
                            font: { name: 'Calibri', bold: true, size: 10, color: { argb: COLORS.text } },
                            alignment: { horizontal: 'left', vertical: 'middle' }
                        };
                    } else { // Datos
                        cell.style = {
                            font: { name: 'Calibri', size: 10, color: { argb: COLORS.text } },
                            alignment: { horizontal: 'right', vertical: 'middle' },
                            border: {
                                top: { style: 'thin', color: { argb: COLORS.darkGray } },
                                bottom: { style: 'thin', color: { argb: COLORS.darkGray } },
                                left: { style: 'thin', color: { argb: COLORS.darkGray } },
                                right: { style: 'thin', color: { argb: COLORS.darkGray } }
                            }
                        };
                        
                        cell.numFmt = '#,##0.00';
                        
                        // Color para sobrante
                        if (i === 2 && rowData[colIndex - 1] !== null) {
                            const value = parseFloat(rowData[colIndex - 1]);
                            cell.font = { 
                                name: 'Calibri', 
                                bold: true, 
                                size: 10, 
                                color: { argb: value >= 0 ? COLORS.success : COLORS.danger } 
                            };
                        }
                    }
                }
            });
        });

        // Porcentaje para TEH/LOGRA
        if (dataFactura?.Cantidad) {
            const percentRow = sheet2.addRow(['Porcentaje', '', (((((statsBaprosa[0]._sum.pesoTeorico / LB_TO_QQ) / 22.0462262) - dataFactura.Cantidad) / dataFactura.Cantidad) * 100).toFixed(2) + '%', '', '', '']);
            const percentCell = sheet2.getCell(sheet2.rowCount, 3);
            percentCell.style = {
                font: { name: 'Calibri', bold: true, size: 10, color: { argb: COLORS.primary } },
                alignment: { horizontal: 'right', vertical: 'middle' },
                border: { outline: { style: 'thin', color: { argb: COLORS.primary } } }
            };
        }

        sheet2.addRow([]);

        // BÁSCULA SEGÚN BAPROSA
        sheet2.mergeCells(`A${sheet2.rowCount}:F${sheet2.rowCount}`);
        const baprosTitle2 = sheet2.getCell(`A${sheet2.rowCount}`);
        baprosTitle2.value = "BÁSCULA SEGÚN BAPROSA";
        Object.assign(baprosTitle2.style, {
            font: { name: 'Calibri', bold: true, size: 12, color: { argb: COLORS.primary } },
            alignment: { horizontal: 'center', vertical: 'middle' },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.gray } },
            border: { outline: { style: 'thin', color: { argb: COLORS.primary } } }
        });

        sheet2.addRow([]);

        // Headers para BAPROSA
        const baprosHeadersRow = sheet2.addRow(['Descripción', 'QQ', 'TM', '', '', '']);
        baprosHeadersRow.eachCell((cell, colIndex) => {
            if (colIndex <= 3) {
                Object.assign(cell.style, styles.header);
            }
        });

        // Datos BAPROSA
        const baprosData = [
            ['Según factura', dataFactura?.Cantidad ? (dataFactura.Cantidad * 22.0462262).toFixed(2) : null, dataFactura?.Cantidad ? dataFactura.Cantidad.toFixed(2) : null],
            ['Enviados', (statsBaprosa[0]._sum.pesoNeto / LB_TO_QQ).toFixed(2), ((statsBaprosa[0]._sum.pesoNeto / LB_TO_QQ) / 22.0462262).toFixed(2)],
            [`${(statsBaprosa[0]._sum.pesoNeto / LB_TO_QQ) - (dataFactura.Cantidad * 22.0462262) >= 0 ? 'Sobrante' : 'Faltante'}`, 
             dataFactura?.Cantidad ? ((statsBaprosa[0]._sum.pesoNeto / LB_TO_QQ) - (dataFactura.Cantidad * 22.0462262)).toFixed(2) : null,
             dataFactura?.Cantidad ? (((statsBaprosa[0]._sum.pesoNeto / LB_TO_QQ) / 22.0462262) - dataFactura.Cantidad).toFixed(2) : null
            ]
        ];

        baprosData.forEach((rowData, i) => {
            const dataRow = sheet2.addRow([rowData[0], rowData[1], rowData[2], '', '', '']);
            dataRow.height = 20;
            
            dataRow.eachCell((cell, colIndex) => {
                if (colIndex <= 3) {
                    if (colIndex === 1) { // Etiqueta
                        cell.style = {
                            font: { name: 'Calibri', bold: true, size: 10, color: { argb: COLORS.text } },
                            alignment: { horizontal: 'left', vertical: 'middle' }
                        };
                    } else { // Datos
                        cell.style = {
                            font: { name: 'Calibri', size: 10, color: { argb: COLORS.text } },
                            alignment: { horizontal: 'right', vertical: 'middle' },
                            border: {
                                top: { style: 'thin', color: { argb: COLORS.darkGray } },
                                bottom: { style: 'thin', color: { argb: COLORS.darkGray } },
                                left: { style: 'thin', color: { argb: COLORS.darkGray } },
                                right: { style: 'thin', color: { argb: COLORS.darkGray } }
                            }
                        };
                        
                        cell.numFmt = '#,##0.00';
                        
                        // Color para faltante
                        if (i === 2 && rowData[colIndex - 1] !== null) {
                            const value = parseFloat(rowData[colIndex - 1]);
                            cell.font = { 
                                name: 'Calibri', 
                                bold: true, 
                                size: 10, 
                                color: { argb: value >= 0 ? COLORS.success : COLORS.danger } 
                            };
                        }
                    }
                }
            });
        });

        // Porcentaje para BAPROSA
        if (dataFactura?.Cantidad) {
            const percentRow2 = sheet2.addRow(['Porcentaje', '', (((((statsBaprosa[0]._sum.pesoNeto / LB_TO_QQ) / 22.0462262) - dataFactura.Cantidad) / dataFactura.Cantidad) * 100).toFixed(2) + '%', '', '', '']);
            const percentCell2 = sheet2.getCell(sheet2.rowCount, 3);
            percentCell2.style = {
                font: { name: 'Calibri', bold: true, size: 10, color: { argb: COLORS.primary } },
                alignment: { horizontal: 'right', vertical: 'middle' },
                border: { outline: { style: 'thin', color: { argb: COLORS.primary } } }
            };
        }

        sheet2.addRow([]);
        sheet2.addRow([]);

        // ===== SECCIÓN 2: DISTRIBUCIÓN POR SILOS =====
        const silosRow = sheet2.addRow([]);
        sheet2.mergeCells(`A${sheet2.rowCount}:C${sheet2.rowCount}`);
        const silosTitle = sheet2.getCell(`A${sheet2.rowCount}`);
        silosTitle.value = "DISTRIBUCIÓN POR SILOS";
        Object.assign(silosTitle.style, styles.sectionTitle);
        
        sheet2.addRow([]);
        
        // Encabezados de silos
        const silosHeaders = sheet2.addRow(['Silo', 'Camiones', 'Quintales']);
        silosHeaders.height = 25;
        
        ['Silo', 'Camiones', 'Quintales'].forEach((header, index) => {
            const cell = sheet2.getCell(sheet2.rowCount, index + 1);
            Object.assign(cell.style, styles.header);
        });
        
        // Datos de silos
        let totalCamiones = 0;
        let totalQuintalesSilos = 0;
        
        silos.forEach((silo, i) => {
            const dataRow = sheet2.addRow([]);
            dataRow.height = 20;
            
            totalCamiones += Number(silo.camiones);
            totalQuintalesSilos += Number(silo.quintales);
            
            const silosData = [silo.nombre, Number(silo.camiones), Number(silo.quintales)];
            silosData.forEach((value, colIndex) => {
                const cell = sheet2.getCell(sheet2.rowCount, colIndex + 1);
                cell.value = value;
                
                if (i % 2 !== 0) {
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
        const totalsSilosRow = sheet2.addRow(['TOTALES:', totalCamiones, totalQuintalesSilos]);
        totalsSilosRow.eachCell((cell, colIndex) => {
            if (colIndex === 1) {
                Object.assign(cell.style, styles.summary);
            } else {
                Object.assign(cell.style, styles.summaryValue);
                if (colIndex === 3) {
                    cell.numFmt = '#,##0.00 "qq"';
                }
            }
        });

        // Configurar anchos de columna para hoja 2
        const columnWidths2 = [30, 15, 25, 25, 25, 25];
        columnWidths2.forEach((width, i) => {
            sheet2.getColumn(i + 1).width = width;
        });

        // Pie de página para hoja 2
        sheet2.addRow([]);
        sheet2.addRow([]);
        const footerRow2 = sheet2.rowCount + 1;
        sheet2.mergeCells(`A${footerRow2}:F${footerRow2}`);
        const footerCell2 = sheet2.getCell(`A${footerRow2}`);
        footerCell2.value = 'BENEFICIO DE ARROZ PROGRESO, S.A. DE C.V. © ' + new Date().getFullYear();
        Object.assign(footerCell2.style, styles.footer);

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

const exportR1Importaciones = async (req, res) => {
    try {
        const buque = req.query.buque || null;
        const factura = req.query.factura || 1;
        
        if (!buque || buque === undefined || buque === 'undefined' || isNaN(buque)) {
            return res.status(400).json({ 
                error: 'Parámetro buque requerido y debe ser un número válido' 
            });
        }

        const ID_MOVIMIENTO = 2;

        // Obtener datos del reporte y información adicional
        const [datosReporte, dataFactura, primeraUnidad, ultimaUnidad, statsGeneral] = await Promise.all([
            db.boleta.findMany({
                include: {
                    tolva: {
                        include: {
                            principal: true,
                            secundario: true,
                            terciario: true, 
                        }
                    },
                },
                where: {
                    idMovimiento: ID_MOVIMIENTO, 
                    idSocio: parseInt(buque), 
                    factura: factura,
                }
            }),

            db.facturas.findFirst({
                where: {
                    factura: factura,
                },
            }),

            db.boleta.findMany({
                select: {
                    id: true,
                    fechaInicio: true,
                }, 
                where: {
                    idSocio: parseInt(buque),
                    factura: factura,
                }, 
                orderBy: {
                    id: 'asc', 
                }, 
                take: 1,   
            }), 

            db.boleta.findMany({
                select: {
                    id: true,
                    fechaInicio: true,
                }, 
                where: {
                    idSocio: parseInt(buque),
                    factura: factura,
                }, 
                orderBy: {
                    id: 'desc', 
                }, 
                take: 1,   
            }),

            db.boleta.groupBy({
                by: ['idSocio', 'socio'],
                where: {
                    idSocio: parseInt(buque), 
                    factura: factura,
                    idMovimiento: ID_MOVIMIENTO,
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
            
        // Procesar datos de boletas
        const boletas = datosReporte.map((el) => {
            const fechaInicio = el.fechaInicio ? new Date(el.fechaInicio) : null;
            const fechaFin = el.fechaFin ? new Date(el.fechaFin) : null;

            const diferenciaMs = fechaInicio && fechaFin ? fechaFin - fechaInicio : null;
            const isEspecialTraslado = el.proceso === 0 && (el.idMovimiento === 10 || el.idMovimiento === 11);

            let diferenciaTiempo = 'N/A';
            if (diferenciaMs !== null) {
                const minutos = Math.floor(diferenciaMs / 60000);
                const horas = Math.floor(minutos / 60);
                const mins = minutos % 60;
                diferenciaTiempo = `${horas}h ${mins}m`;
            }

            return {
                Boleta: el.numBoleta,
                Proceso: el.proceso == 0 ? 'Entrada' : 'Salida',
                Placa: el.placa,
                Cliente: el.socio,
                Transporte: el.empresa,
                Motorista: el.motorista,
                Movimiento: el.movimiento,
                Producto: el.producto,
                Manifiesto: el.manifiesto || '-',
                OrdenDeCompra: el.ordenDeCompra || '-',
                OrdenDeTransferencia: el.ordenDeTransferencia || '-',
                Origen: (el.movimiento == 'Traslado Interno' || el.movimiento == 'Traslado Externo') ? el.trasladoOrigen : el.origen,
                Destino: (el.movimiento == 'Traslado Interno' || el.movimiento == 'Traslado Externo') ? el.trasladoDestino : el.destino,
                Tara: isEspecialTraslado ? el.pesoInicial : ((el.proceso == 0 ? el.pesoFinal : el.pesoInicial) || 0),
                PesoBruto: isEspecialTraslado ? el.pesoFinal : ((el.proceso == 0 ? el.pesoInicial : el.pesoFinal) || 0),
                PesoNeto: el.pesoNeto || 0,
                PesoTeorico: el.pesoTeorico || 0,
                Desviación: el.desviacion || 0,
                Tolerancia: (el.pesoTeorico * el.porTolerancia) || 0,
                Estado: el.estado,
                FechaDeEntrada: fechaInicio ? fechaInicio.toLocaleString() : 'N/A',
                FechaFinalizacion: fechaFin ? fechaFin.toLocaleString() : 'N/A',
                TiempoTotal: diferenciaTiempo,
                Sello1: el.sello1 || '-', 
                Sello2: el.sello2 || '-',
                Sello3: el.sello3 || '-',
                Sello4: el.sello4 || '-',
                Sello5: el.sello5 || '-',
                Sello6: el.sello6 || '-', 
            };
        });

        // Crear el libro de trabajo Excel
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'BAPROSA';
        workbook.lastModifiedBy = 'Sistema de Básculas';
        workbook.created = new Date();
        workbook.modified = new Date();

        // ===== HOJA 1: DETALLE DE IMPORTACIONES =====
        const sheet1 = workbook.addWorksheet("Detalle Importaciones", CONFIGPAGE);

        // Logo o placeholder
        try {
            const logoId = workbook.addImage({
                filename: "logo.png",
                extension: "png",
            });
            sheet1.addImage(logoId, {
                tl: { col: 4, row: 0 },
                br: { col: 6, row: 3 },
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
        sheet1.mergeCells("A1:H1");
        const titleCell = sheet1.getCell("A1");
        titleCell.value = "BENEFICIO DE ARROZ PROGRESO, S.A. DE C.V.";
        Object.assign(titleCell.style, styles.title);
        
        sheet1.mergeCells("A2:H2");
        const subtitleCell = sheet1.getCell("A2");
        subtitleCell.value = `REPORTE DETALLADO DE IMPORTACIONES`;
        Object.assign(subtitleCell.style, styles.subtitle);

        // Información de la importación
        sheet1.mergeCells("A3:H3");
        const productCell = sheet1.getCell("A3");
        productCell.value = `GRANZA AMERICANA`;
        Object.assign(productCell.style, styles.dateInfo);

        sheet1.mergeCells("A4:H4");
        const proveedorCell = sheet1.getCell("A4");
        proveedorCell.value = `Proveedor: ${dataFactura?.Proveedor || 'N/A'}`;
        Object.assign(proveedorCell.style, styles.dateInfo);

        sheet1.mergeCells("A5:H5");
        const infoCell = sheet1.getCell("A5");
        infoCell.value = `Factura: ${factura || 'N/A'}`;
        Object.assign(infoCell.style, styles.dateInfo);

        sheet1.mergeCells("A6:H6");
        const buqueCell = sheet1.getCell("A6");
        buqueCell.value = `Buque: ${statsGeneral.length > 0 ? statsGeneral[0].socio.toUpperCase() : 'N/A'}`;
        Object.assign(buqueCell.style, styles.dateInfo);

        if (primeraUnidad.length > 0 && ultimaUnidad.length > 0) {
            sheet1.mergeCells("A7:H7");
            const fechasCell = sheet1.getCell("A7");
            fechasCell.value = `Inicio: ${new Date(primeraUnidad[0].fechaInicio).toLocaleString()} - Fin: ${new Date(ultimaUnidad[0].fechaInicio).toLocaleString()}`;
            Object.assign(fechasCell.style, styles.dateInfo);
        }
        
        const now = new Date();
        sheet1.mergeCells("A8:H8");
        const dateCell = sheet1.getCell("A8");
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

        // ===== DETALLE DE BOLETAS =====
        const detalleRow = sheet1.addRow([]);
        sheet1.mergeCells(`A${sheet1.rowCount}:Y${sheet1.rowCount}`);
        const detalleTitle = sheet1.getCell(`A${sheet1.rowCount}`);
        detalleTitle.value = "DETALLE DE BOLETAS";
        Object.assign(detalleTitle.style, styles.sectionTitle);
        
        sheet1.addRow([]);

        // Encabezados principales para el detalle
        const mainHeaders = [
            'Boleta', 'Proceso', 'Placa', 'Cliente', 'Transporte', 'Motorista', 'Movimiento', 'Producto',
            'Orden Compra', 'Origen', 'Destino', 'Tara', 'Peso Bruto',
            'Peso Neto', 'Peso Teórico', 'Desviación', 'Tolerancia', 'Estado', 'Fecha Entrada', 
            'Fecha Finalización', 'Tiempo Total', 'Sello1', 'Sello2', 'Sello3', 'Sello4'
        ];

        const headerRow = sheet1.addRow(mainHeaders);
        headerRow.height = 25;
        
        mainHeaders.forEach((header, index) => {
            const cell = sheet1.getCell(sheet1.rowCount, index + 1);
            Object.assign(cell.style, styles.header);
        });

        // Datos de boletas
        boletas.forEach((boleta, i) => {
            const dataRow = sheet1.addRow([
                boleta.Boleta,
                boleta.Proceso,
                boleta.Placa,
                boleta.Cliente,
                boleta.Transporte,
                boleta.Motorista,
                boleta.Movimiento,
                boleta.Producto,
                boleta.OrdenDeCompra,
                boleta.Origen,
                boleta.Destino,
                boleta.Tara,
                boleta.PesoBruto,
                boleta.PesoNeto,
                boleta.PesoTeorico,
                boleta.Desviación,
                boleta.Tolerancia,
                boleta.Estado,
                boleta.FechaDeEntrada,
                boleta.FechaFinalizacion,
                boleta.TiempoTotal,
                boleta.Sello1,
                boleta.Sello2, 
                boleta.Sello3,
                boleta.Sello4,
            ]);
            dataRow.height = 20;
            
            // Aplicar estilos alternados
            dataRow.eachCell((cell, colIndex) => {
                if (i % 2 !== 0) {
                    cell.style = {...styles.data, ...styles.alternateRow};
                } else {
                    Object.assign(cell.style, styles.data);
                }
                
                // Formateo específico por columna
                if (colIndex >= 12 && colIndex <= 17) { // Columnas de peso (ajustadas)
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    cell.numFmt = '#,##0.00';
                    
                    // Colorear desviación
                    if (colIndex === 16) { // Desviación (ajustada)
                        const value = boleta.Desviación;
                        if (value >= 0) {
                            cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.success } };
                        } else {
                            cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.danger } };
                        }
                    }
                }
                
                // Estado
                if (colIndex === 18) { // Estado (ajustada)
                    if (cell.value === 'Completada') {
                        cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.success } };
                    } else if (cell.value === 'Cancelada') {
                        cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.danger } };
                    }
                }
            });
        });

        // Configurar anchos de columna
        const columnWidths = [
            12, 12, 12, 20, 20, 20, 18, 15, 
            15, 15, 15, 12, 12, 
            12, 12, 12, 12, 12, 20, 
            20, 15, 12, 12
        ];
        columnWidths.forEach((width, i) => {
            sheet1.getColumn(i + 1).width = width;
        });

        // Pie de página
        sheet1.addRow([]);
        sheet1.addRow([]);
        const footerRowNum = sheet1.rowCount + 1;
        sheet1.mergeCells(`A${footerRowNum}:W${footerRowNum}`);
        const footerCell = sheet1.getCell(`A${footerRowNum}`);
        footerCell.value = 'BENEFICIO DE ARROZ PROGRESO, S.A. DE C.V. © ' + new Date().getFullYear();
        Object.assign(footerCell.style, styles.footer);

        // Configurar la respuesta para descargar el archivo Excel
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="reporte_importaciones_${factura || 'sin_factura'}_${new Date().toISOString().split('T')[0]}.xlsx"`);
        
        // Escribir el archivo Excel a la respuesta
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error en exportR1Importaciones:', error);
        
        return res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
module.exports = {
    buquesBoletas, 
    getResumenBFH,
    getBuqueDetalles, 
    getBuqueStats,
    exportR1Importaciones, 
    getInformePagoAtrasnporte, 
}