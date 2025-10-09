const db = require("../lib/prisma");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { QUINTALTONELADA, GRANZA, IMPORTACIONES } = require("../utils/variablesInformes");
const ExcelJS = require('exceljs');
const { CONFIGPAGE, COLORS, styles } = require("../lib/configExcel");
const { setLogger } = require("../utils/logger");

const buquesBoletas = async(req, res) => {
    try{
        const buque = req.query.buque!==undefined ? parseInt(req.query.buque) : null;
        const typeImp = req.query.typeImp!==undefined ? parseInt(req.query.typeImp) : null;
        
        const [dataSocio, dataFacturas] = await Promise.all([
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

        const sociosImp = typeImp ? dataSocio.map((item) => ({
            ...item,
            id: item.idSocio, nombre: item.socio,
        })) : [];

        /**
         * El \u200B es para simular el salto de liena en el react select
         */
        const facturasImp = (buque && typeImp) ? dataFacturas.map((item) => ({
            ...item,
            id: item.factura, nombre: `SAP: ${item.factura} \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B \u200B PROV: ${item.facturaProveedor || 'N/A'} ` 
        })) : [];
        
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

        const [facturas, total, sacosContenerizados, cantidadViajes, getSilos] = await Promise.all([
            db.facturas.findMany({
                where: {
                    idSocio: parseInt(buque),
                    factura: factura, 
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
            }),
            typeImp == 15 ? db.boleta.findMany({
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
                include: {
                    impContenerizada: true,
                } 
            }) : null,
            db.boleta.count({
                where: {
                    estado: {
                        not: {
                            in: ['Pendiente', 'Cancelada'],
                        }
                    }, 
                    idMovimiento: parseInt(typeImp), 
                    factura: factura,
                }
            }), 
            typeImp == 2 ? db.$queryRaw`
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
                    SUM(pesoNeto)/100 as quintales
                FROM BoletasUnicas
                GROUP BY nombre
                ORDER BY nombre asc
            ` : null,
        ])


        
        let acumuladasUnidadesRecibidas = 0;
        let acumuladasunidadesTeoricas = 0;

        if(typeImp==15) {
            sacosContenerizados.forEach((items) => {
                acumuladasUnidadesRecibidas += items.impContenerizada.sacosCargados;
                acumuladasunidadesTeoricas += items.impContenerizada.sacosTeoricos;
            });
        }

        if(total.length==0) return res.status(200).send({err: 'Buque no seleecionado'})
        const {_sum} = total[0]
        const refactorData = {
            facturas: facturas.length || 'No cuenta con facturas',
            cantidad: facturas[0].Cantidad,
            pesoNeto: (_sum.pesoNeto/QUINTALTONELADA).toFixed(2), 
            pesoTeorico: (_sum.pesoTeorico/QUINTALTONELADA).toFixed(2),
            desviacion: (_sum.desviacion/QUINTALTONELADA).toFixed(2),
            porcentaje: ((_sum.desviacion/QUINTALTONELADA)/(_sum.pesoTeorico/QUINTALTONELADA)*100).toFixed(2), 
            status: facturas[0].Proceso || 'No seleccionado', 
            sacosTeroicos: acumuladasunidadesTeoricas,
            sacosDescargados: acumuladasUnidadesRecibidas, 
            diferenciaSacos: acumuladasUnidadesRecibidas - acumuladasunidadesTeoricas, 
            porcentajeSacosDiff: acumuladasunidadesTeoricas !== 0 ? ((acumuladasUnidadesRecibidas - acumuladasunidadesTeoricas) / acumuladasunidadesTeoricas) * 100 : 0,
            cantidadViajes: cantidadViajes,
            getSilos,
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
                desviacion: true, 
                factura: true,
                impContenerizada:true,
                tolva: {
                    select: {
                        principal: { select: { nombre: true } },
                        secundario: { select: { nombre: true } },
                        terciario: { select: { nombre: true } },
                    },
                },
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
            pesoTeorico: row.pesoTeorico ? (row.pesoTeorico / 100).toFixed(2) : 0, // libras → TM
            pesoNeto: row.pesoNeto ? (row.pesoNeto / 100).toFixed(2) : 0,           // libras → TM
            desviacion: row.desviacion ? (row.desviacion / 100).toFixed(2) : 0,   // libras → TM
            siloPrincipalNombre: row.tolva[0]?.principal?.nombre || ' - ',
            siloSecundarioNombre: row.tolva[0]?.secundario?.nombre || ' - ',
            siloTerciarioNombre: row.tolva[0]?.terciario?.nombre || ' - ',
            contenedor: row?.impContenerizada?.contenedor || ' - ',
            sacosCargados: row?.impContenerizada?.sacosCargados || '-',
            sacosTeoricos: row?.impContenerizada?.sacosTeoricos || '-',
            PrecintosOrigen: row?.impContenerizada?.marchamoDeOrigen || '-', 
            tolva: undefined,
            impContenerizada: undefined,  
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
        const PAGO_POR_VIAJE = parseFloat(req.query.tarifa) || 317.4;
        const PAGO_DOLAR_COMPRA = parseFloat(req.query.tasaCompraDolar) || 26.0430;
        const PAGO_DOLAR_VENTA = parseFloat(req.query.tasaVentaDolar) || 26.1732;
        const COSTE_DEL_QUINTAL = parseFloat(req.query.costeQuintal) || 545.0;

        const ID_MOVIMIENTO = 2;

        if (!buque || isNaN(buque)) {
            return res.status(400).json({ 
                error: 'Parámetro buque requerido y debe ser un número válido' 
            });
        }

        const [getSilos, pagos, statsBaprosa, primeraUnidad, ultimaUnidad, empresasCobro] = await Promise.all([
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

        const silos = getSilos.sort((a, b) =>
            a.nombre.localeCompare(b.nombre, undefined, { numeric: true, sensitivity: 'base' })
        );

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
        sheet1.getCell("A3").value = "PRODUCTO:";
        Object.assign(sheet1.getCell("A3").style, styles.dateInfo);
        sheet1.mergeCells("B3:E3");
        const productCell = sheet1.getCell("B3");
        productCell.value = "GRANZA AMERICANA";
        Object.assign(productCell.style, styles.dateInfo);

        sheet1.getCell("A4").value = "PROVEEDOR:";
        Object.assign(sheet1.getCell("A4").style, styles.dateInfo);
        sheet1.mergeCells("B4:E4");
        const proveedorCell = sheet1.getCell("B4");
        proveedorCell.value = dataFactura?.Proveedor || 'N/A';
        Object.assign(proveedorCell.style, styles.dateInfo);

        // Fila 5 - Factura
        sheet1.getCell("A5").value = "FACTURA SAP:";
        Object.assign(sheet1.getCell("A5").style, styles.dateInfo);
        sheet1.mergeCells("B5:E5");
        const infoCell = sheet1.getCell("B5");
        infoCell.value = factura || 'N/A';
        Object.assign(infoCell.style, styles.dateInfo);

        // Fila 5 - FacturaProveedor
        sheet1.getCell("A6").value = "FACTURA PROVEEDOR:";
        Object.assign(sheet1.getCell("A6").style, styles.dateInfo);
        sheet1.mergeCells("B6:E6");
        const facturaProveedor = sheet1.getCell("B6");
        facturaProveedor.value = dataFactura?.facturaProveedor || 'N/A';
        Object.assign(facturaProveedor.style, styles.dateInfo);

        // Fila 6 - Buque
        sheet1.getCell("A7").value = "BUQUE:";
        Object.assign(sheet1.getCell("A7").style, styles.dateInfo);
        sheet1.mergeCells("B7:E7");
        const buqueCell = sheet1.getCell("B7");
        buqueCell.value = ingresoBaprosa[0].socio.toUpperCase();
        Object.assign(buqueCell.style, styles.dateInfo);

        // Fila 7 - Transportes (corregido el label)
        sheet1.getCell("A8").value = "TRANSPORTES:";
        Object.assign(sheet1.getCell("A8").style, styles.dateInfo);
        sheet1.mergeCells("B8:E8");
        const transportesUsados = sheet1.getCell("B8");
        transportesUsados.value = pagos.map(item => item.empresa).join(', ').toUpperCase();
        Object.assign(transportesUsados.style, styles.dateInfo);

        // Fila 8 - Fechas de inicio y fin
        sheet1.getCell("A9").value = "PERÍODO:";
        Object.assign(sheet1.getCell("A9").style, styles.dateInfo);
        sheet1.mergeCells("B9:E9");
        const fechasDeInicioYfin = sheet1.getCell("B9");
        fechasDeInicioYfin.value = `Inicio: ${new Date(primeraUnidad[0].fechaInicio).toLocaleString()} - Hasta: ${new Date(ultimaUnidad[0].fechaInicio).toLocaleString()}`;
        Object.assign(fechasDeInicioYfin.style, styles.dateInfo);

        // Fila 9 - Fecha de generación
        const now = new Date();
        sheet1.getCell("A10").value = "GENERADO:";
        Object.assign(sheet1.getCell("A10").style, styles.dateInfo);
        sheet1.mergeCells("B10:E10");
        const dateCell = sheet1.getCell("B10");
        dateCell.value = now.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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

        const transporteHeaders2 = sheet1.addRow(['Empresa', 'Total Viajes', 'Tarifa Viaje','Pago USD', 'TASA USD','Pago LPS']);
        transporteHeaders2.height = 25;
        
        // Aplicar estilos a encabezados de transporte
        ['Empresa', 'Total Viajes', 'Tarifa USD', 'Pago USD', 'TASA USD', 'Pago LPS'].forEach((header, index) => {
            const cell = sheet1.getCell(sheet1.rowCount, index + 1);
            Object.assign(cell.style, styles.header);
        });
        
        let totalApagar = 0;
        
        pagoTransportes.forEach((pago, i) => {
            const dataRow = sheet1.addRow([]);
            dataRow.height = 20;
            
            totalApagar += pago.pagosLempiras;
            
            const transporteData = [pago.socio,pago.totalViajes,PAGO_POR_VIAJE, pago.pagosDolares, pago.tasaAplicada, pago.pagosLempiras];
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
                    if (colIndex === 2 || colIndex === 3) {
                        cell.numFmt = '$#,##0.00';
                    } else if (colIndex === 4) {
                        cell.numFmt = 'L#,##0.0000';
                    } else if (colIndex >= 4) {
                        cell.numFmt = 'L#,##0.00';
                    }
                }
            });
        });
        
        
        // Totales de transportes en lempiras
        const pagosEnLempiras = sheet1.addRow(['TOTALES:', totalViajesTransporte, '-',totalPagosUSD, '-',totalApagar]);
        pagosEnLempiras.eachCell((cell, colIndex) => {
            if (colIndex === 1) {
                Object.assign(cell.style, styles.summary);
            } else {
                Object.assign(cell.style, styles.summaryValue);
                if (colIndex === 4) {
                    cell.numFmt = '$#,##0.00';
                } else if (colIndex >= 5) {
                    cell.numFmt = 'L#,##0.00';
                }
            }
        });

        sheet1.addRow([]);
        sheet1.addRow([]);


        /* Parte Inicial */
        const empresasTitle = sheet1.addRow(['TRANSPORTES CON DESVIACIÓN Y COBROS']);
        sheet1.mergeCells(`A${empresasTitle.number}:F${empresasTitle.number}`);
        const empresasTitleCell = sheet1.getCell(`A${empresasTitle.number}`);
        Object.assign(empresasTitleCell.style, styles.sectionTitle);

        let totalPesoTeorico2 = 0;
        let totalPesoNeto2 = 0;
        let totalDesviacion2 = 0;

        Object.entries(boletasPorEmpresa).forEach(([empresa, boletas], empresaIndex) => {
            // Título de la empresa
            const headerRow = sheet1.addRow([empresa]);
            sheet1.mergeCells(`A${headerRow.number}:F${headerRow.number}`);
            const headerCell = sheet1.getCell(`A${headerRow.number}`);
            Object.assign(headerCell.style, styles.sectionTitle);

            // Encabezados de las columnas para las boletas
            const columnHeaderRow = sheet1.addRow([
                'N° Boleta',
                'Placa',
                'Motorista', 
                'Peso Neto',
                'Peso Teórico',
                'Desviación (lb)'
            ]);
            
            ['N° Boleta', 'Placa', 'Motorista', 'Peso Neto', 'Peso Teórico', 'Desviación (lb)'].forEach((header, index) => {
                const cell = sheet1.getCell(sheet1.rowCount, index + 1);
                Object.assign(cell.style, styles.header);
            });

            // Inicializar totales para esta empresa
            let desviacionEmpresa = 0;

            // Procesar las boletas de la empresa
            boletas.forEach((boleta, i) => {
                const dataRow = sheet1.addRow([]);
                dataRow.height = 20;

                // Acumular totales generales
                totalPesoTeorico2 += boleta.pesoTeorico || 0;
                totalPesoNeto2 += boleta.pesoNeto || 0;
                totalDesviacion2 += boleta.desviacion || 0;

                // Acumular desviación de esta empresa
                desviacionEmpresa += boleta.desviacion || 0;

                // Los datos que quieres mostrar por cada boleta
                const rowData = [
                    boleta.numBoleta,
                    boleta.placa,
                    boleta.motorista,
                    boleta.pesoNeto,
                    boleta.pesoTeorico,
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
                        if (colIndex === 3 || colIndex === 4) { // peso neto y teórico
                            cell.numFmt = '#,##0';
                        } else if (colIndex === 5) { // desviación
                            cell.numFmt = '#,##0';
                        }
                    }
                });
            });

            // RESUMEN DE COBRO PARA ESTA EMPRESA (ABAJO DE LAS BOLETAS)
            sheet1.addRow([]); // Fila vacía separadora

            // Título del resumen de cobro
            const cobroTitleRow = sheet1.addRow(['COBRO PARA ' + empresa.toUpperCase()]);
            sheet1.mergeCells(`A${cobroTitleRow.number}:F${cobroTitleRow.number}`);
            const cobroTitleCell = sheet1.getCell(`A${cobroTitleRow.number}`);
            Object.assign(cobroTitleCell.style, {
                ...styles.sectionTitle,
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7E6E6' } }
            });

            // Encabezados del resumen
            const resumenHeaderRow = sheet1.addRow([
                'Concepto',
                'Precio Quintal',
                'Desviación QQ',
                'Total USD',
                'Tasa Dólar',
                'TOTAL LPS'
            ]);
            
            ['Concepto', 'Precio Quintal', 'Desviación QQ', 'Total USD', 'Tasa Dólar', 'TOTAL LPS'].forEach((header, index) => {
                const cell = sheet1.getCell(sheet1.rowCount, index + 1);
                Object.assign(cell.style, styles.header);
            });

            // Calcular valores para el resumen
            const desviacionQuintales = Math.abs(desviacionEmpresa / 100);
            const costoDolar = desviacionQuintales * COSTE_DEL_QUINTAL;
            const tasaAplicada = empresa === 'Transportes Esher' ? PAGO_DOLAR_COMPRA : PAGO_DOLAR_VENTA;
            const costoLempiras = costoDolar * tasaAplicada;

            // Fila de datos del resumen
            const resumenDataRow = sheet1.addRow([
                'Cobro por Desviación',
                COSTE_DEL_QUINTAL,
                desviacionQuintales,
                costoDolar,
                tasaAplicada,
                costoLempiras
            ]);
            resumenDataRow.height = 20;

            // Aplicar estilos y formatos al resumen
            const conceptoCell = sheet1.getCell(`A${resumenDataRow.number}`);
            const precioCell = sheet1.getCell(`B${resumenDataRow.number}`);
            const desviacionCell = sheet1.getCell(`C${resumenDataRow.number}`);
            const totalUSDCell = sheet1.getCell(`D${resumenDataRow.number}`);
            const tasaCell = sheet1.getCell(`E${resumenDataRow.number}`);
            const totalLPSCell = sheet1.getCell(`F${resumenDataRow.number}`);

            // Estilos para todas las celdas del resumen
            [conceptoCell, precioCell, desviacionCell, totalUSDCell, tasaCell].forEach(cell => {
                Object.assign(cell.style, styles.data);
            });

            // Estilo especial para el total final (destacado)
            Object.assign(totalLPSCell.style, styles.data);

            // Alineaciones
            conceptoCell.alignment = { horizontal: 'left', vertical: 'middle' };
            [precioCell, desviacionCell, totalUSDCell, tasaCell, totalLPSCell].forEach(cell => {
                cell.alignment = { horizontal: 'right', vertical: 'middle' };
            });

            // Formatos numéricos
            precioCell.numFmt = '$#,##0.00';
            desviacionCell.numFmt = '#,##0.00';
            totalUSDCell.numFmt = '$#,##0.00';
            tasaCell.numFmt = '#,##0.0000';
            totalLPSCell.numFmt = 'L #,##0.00';

            // Espacio entre empresas
            sheet1.addRow([]);
            sheet1.addRow([]);
        });

        /* Parte Fin */

        const columnWidths1 = [25, 15, 20, 20, 20, 20];
        columnWidths1.forEach((width, i) => {
            sheet1.getColumn(i + 1).width = width;
        });

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

        sheet2.getCell("A3").value = "PRODUCTO:";
        Object.assign(sheet2.getCell("A3").style, styles.dateInfo);
        sheet2.mergeCells("B3:E3");
        const productCell2 = sheet2.getCell("B3");
        productCell2.value = "GRANZA AMERICANA";
        Object.assign(productCell2.style, styles.dateInfo);

        // Fila 4 - Proveedor
        sheet2.getCell("A4").value = "PROVEEDOR:";
        Object.assign(sheet2.getCell("A4").style, styles.dateInfo);
        sheet2.mergeCells("B4:E4");
        const proveedorCell2 = sheet2.getCell("B4");
        proveedorCell2.value = dataFactura?.Proveedor || 'N/A';
        Object.assign(proveedorCell2.style, styles.dateInfo);

        // Fila 5 - Factura
        sheet2.getCell("A5").value = "FACTURA SAP:";
        Object.assign(sheet2.getCell("A5").style, styles.dateInfo);
        sheet2.mergeCells("B5:E5");
        const infoCell2 = sheet2.getCell("B5");
        infoCell2.value = factura || 'N/A';
        Object.assign(infoCell2.style, styles.dateInfo);


        // Fila 5 - Factura Proveedor
        sheet2.getCell("A6").value = "FACTURA PROVEEDOR:";
        Object.assign(sheet2.getCell("A6").style, styles.dateInfo);
        sheet2.mergeCells("B6:E6");
        const facturaProveedor2 = sheet2.getCell("B6");
        facturaProveedor2.value = dataFactura?.facturaProveedor || 'N/A';
        Object.assign(facturaProveedor2.style, styles.dateInfo);

        // Fila 6 - Buque
        sheet2.getCell("A7").value = "BUQUE:";
        Object.assign(sheet2.getCell("A7").style, styles.dateInfo);
        sheet2.mergeCells("B7:E7");
        const buqueCell2 = sheet2.getCell("B7");
        buqueCell2.value = ingresoBaprosa[0].socio.toUpperCase();
        Object.assign(buqueCell2.style, styles.dateInfo);

        // Fila 7 - Transportes
        sheet2.getCell("A8").value = "TRANSPORTES:";
        Object.assign(sheet2.getCell("A8").style, styles.dateInfo);
        sheet2.mergeCells("B8:E8");
        const transportesUsados2 = sheet2.getCell("B8");
        transportesUsados2.value = pagos.map(item => item.empresa).join(', ').toUpperCase();
        Object.assign(transportesUsados2.style, styles.dateInfo);

        // Fila 8 - Fechas de inicio y fin
        sheet2.getCell("A9").value = "PERÍODO:";
        Object.assign(sheet2.getCell("A9").style, styles.dateInfo);
        sheet2.mergeCells("B9:E9");
        const fechasDeInicioYfin2 = sheet2.getCell("B9");
        fechasDeInicioYfin2.value = `Inicio: ${new Date(primeraUnidad[0].fechaInicio).toLocaleString()} - Hasta: ${new Date(ultimaUnidad[0].fechaInicio).toLocaleString()}`;
        Object.assign(fechasDeInicioYfin2.style, styles.dateInfo);

        // Fila 9 - Fecha de generación
        sheet2.getCell("A10").value = "GENERADO:";
        Object.assign(sheet2.getCell("A10").style, styles.dateInfo);
        sheet2.mergeCells("B10:E10");
        const dateCell2 = sheet2.getCell("B10");
        dateCell2.value = now.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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

        /* Proteger Reportes */
        sheet1.protect('baprosa', { formatCells: false, formatColumns: false });
        sheet2.protect('baprosa', { formatCells: false, formatColumns: false });


        // Configurar la respuesta para descargar el archivo Excel
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="informe_pago_transporte_${factura || 'sin_factura'}_${new Date().toISOString().split('T')[0]}.xlsx"`);
        
        setLogger('REPORTES', `CREO REPORTE DE LIQUIDACIÓN PARA ${ingresoBaprosa[0].socio.toUpperCase()} - SAP ${factura}: TARIFA: ${PAGO_POR_VIAJE}, DOLAR COMPRA: ${PAGO_DOLAR_COMPRA}, DOLAR VENTA: ${PAGO_DOLAR_VENTA}, COSTE DEL QUINTAL: ${COSTE_DEL_QUINTAL}`, req, null, 1, null);

        // Escribir el archivo Excel a la respuesta
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error en exportInformePagoTransporte:', error);
        setLogger('REPORTES', 'EN GENERAR REPORTE DE LIQUIDACIÓN', req, null, 3);
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
                tl: { col: 6, row: 0 },
                br: { col: 8, row: 3 },
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
        sheet1.mergeCells("A1:E1");
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
        infoCell.value = `Factura SAP: ${factura || 'N/A'}`;
        Object.assign(infoCell.style, styles.dateInfo);

        sheet1.mergeCells("A6:H6");
        const infoPro = sheet1.getCell("A6");
        infoPro.value = `Factura proveedor: ${dataFactura?.facturaProveedor || 'N/A'}`;
        Object.assign(infoPro.style, styles.dateInfo);

        sheet1.mergeCells("A7:H7");
        const buqueCell = sheet1.getCell("A7");
        buqueCell.value = `Buque: ${statsGeneral.length > 0 ? statsGeneral[0].socio.toUpperCase() : 'N/A'}`;
        Object.assign(buqueCell.style, styles.dateInfo);

        if (primeraUnidad.length > 0 && ultimaUnidad.length > 0) {
            sheet1.mergeCells("A8:H8");
            const fechasCell = sheet1.getCell("A8");
            fechasCell.value = `Inicio: ${new Date(primeraUnidad[0].fechaInicio).toLocaleString()} - Hasta: ${new Date(ultimaUnidad[0].fechaInicio).toLocaleString()}`;
            Object.assign(fechasCell.style, styles.dateInfo);
        }
        
        const now = new Date();
        sheet1.mergeCells("A9:H9");
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

        /* Proteger Hoja */
        sheet1.protect('baprosa', { formatCells: false, formatColumns: false });

        // Configurar la respuesta para descargar el archivo Excel
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="reporte_importaciones_${factura || 'sin_factura'}_${new Date().toISOString().split('T')[0]}.xlsx"`);
        
        setLogger('REPORTES', `CREO REPORTE DE REGISTROS DE ${statsGeneral[0].socio.toUpperCase()} - SAP ${factura} `, req, null, 1, null);

        // Escribir el archivo Excel a la respuesta
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error en exportR1Importaciones:', error);
        setLogger('REPORTES', 'EN GENERAR REPORTE DE REGISTROS DE IMPORTACIONES', req, null, 3);

        return res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getRerportContenerizada = async (req, res) => {
    try {
        const socio = req.query.socio || null;
        const factura = req.query.factura || 1;
        
        if (!socio || socio === undefined || socio === 'undefined' || isNaN(socio)) {
            return res.status(400).json({ 
                error: 'Parámetro socio requerido y debe ser un número válido' 
            });
        }

        const [datosReporte, dataFactura, primeraUnidad, ultimaUnidad, statsGeneral] = await Promise.all([
            db.boleta.findMany({
                select: {
                    id: true,
                    fechaInicio: true,
                    fechaFin: true,
                    numBoleta: true, 
                    placa: true,
                    sello1: true,
                    sello2: true,
                    sello3: true,
                    sello4: true,
                    sello5: true,
                    sello6: true,
                    motorista: true, 
                    pesoNeto: true,
                    pesoTeorico: true,
                    desviacion: true,
                    socio: true,
                    empresa: true,
                    movimiento: true,
                    producto: true,
                    origen: true, 
                    estado: true,
                    proceso: true,
                    ordenDeCompra: true, 
                    impContenerizada: {
                        select: {
                            contenedor: true,
                            sacosTeoricos: true, 
                            marchamoDeOrigen: true, 
                            encargadoDeNombre: true,
                            sacosCargados: true,
                            bodega: true,
                        }
                    }, 
                },
                where: {
                    idSocio: parseInt(socio), 
                    factura: factura,
                },
                orderBy: {
                    id: 'asc'
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
                    idSocio: parseInt(socio),
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
                    idSocio: parseInt(socio),
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
                    idSocio: parseInt(socio), 
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

        let acumuladoQuintales = 0;
        let acumuladoToneladas = 0; 
        let acumuladoUnidades = 0;

        const boletasContenerizadas = datosReporte.map((el) => {
            const fechaFin = el.fechaFin ? new Date(el.fechaFin) : null;
            const pesoNeto = el.pesoNeto || 0;
            const pesoNetoQQ = pesoNeto / 100; 
            const pesoNetoTM = pesoNeto / 2204.62; // libras a toneladas métricas (1 TM = 2204.62 libras)
            const sacosCargados = el.impContenerizada?.sacosCargados || 0;

            acumuladoQuintales += pesoNetoQQ;
            acumuladoToneladas += pesoNetoTM; 
            acumuladoUnidades += sacosCargados;

            const fechaInicio = el.fechaInicio ? new Date(el.fechaInicio) : null;
            const diferenciaMs = fechaInicio && fechaFin ? fechaFin - fechaInicio : null;
            let tiempoBascula = 'N/A';
            if (diferenciaMs !== null) {
                const minutos = Math.floor(diferenciaMs / 60000);
                const horas = Math.floor(minutos / 60);
                const mins = minutos % 60;
                tiempoBascula = `${horas}h ${mins}m`;
            }

            return {
                Fecha: fechaFin ? fechaFin.toLocaleDateString('es-ES') : 'N/A',
                Item: datosReporte.indexOf(el) + 1, 
                Boleta: el.numBoleta,
                Placa: el.placa,
                Contenedor: el.impContenerizada?.contenedor || '-',
                PrecintosOrigen: el.impContenerizada?.marchamoDeOrigen || '-',
                SelloOPC: el.sello1 ? `LN${el.sello1}` : '-',
                Motorista: el.motorista,
                EncargadoBodega: el.impContenerizada?.encargadoDeNombre || '-',
                BodegaDescarga: el.impContenerizada?.bodega || '-',
                PesoNetoQQ: pesoNetoQQ,
                PesoNetoTM: pesoNetoTM, 
                TiempoBascula: tiempoBascula,
                AcumuladoQQ: acumuladoQuintales,
                AcumuladoTM: acumuladoToneladas, 
                CantidadContenedor: el.impContenerizada?.sacosTeoricos || 0,
                CantidadRecibida: sacosCargados,
                UnidadesAcumuladas: acumuladoUnidades
            };
        });

        const resumenGeneral = {
            bascula : {
                toneladaMetrica : acumuladoToneladas.toFixed(2),
                quintales : acumuladoQuintales.toFixed(2),
            }, 
            factura: {
                toneladaMetrica: (dataFactura.Cantidad.toFixed(2)),
                quintales: (dataFactura.Cantidad * 22.0462).toFixed(2),
            }, 
            diferencias: {
                toneladaMetrica: (acumuladoToneladas - dataFactura.Cantidad).toFixed(2),
                quintales: (acumuladoQuintales - (dataFactura.Cantidad * 22.0462)).toFixed(2),
            }
        }

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'BAPROSA';
        workbook.lastModifiedBy = 'Sistema de Básculas';
        workbook.created = new Date();
        workbook.modified = new Date();

        const sheet1 = workbook.addWorksheet("Detalle Contenerizada", CONFIGPAGE);

        // Logo 
        try {
            const logoId = workbook.addImage({
                filename: "logo.png",
                extension: "png",
            });
            sheet1.addImage(logoId, {
                tl: { col: 0, row: 0 }, 
                br: { col: 2, row: 3 }, 
                editAs: 'oneCell'
            });
        } catch (error) {
            sheet1.mergeCells("A1:B3");
            const placeholderCell = sheet1.getCell("A1");
            placeholderCell.value = "BAPROSA";
            placeholderCell.style = {
                font: { name: 'Arial', bold: true, size: 18, color: { argb: COLORS.primary } },
                alignment: { horizontal: 'center', vertical: 'middle' },
                border: { 
                    top: { style: 'medium', color: { argb: COLORS.secondary } },
                    left: { style: 'medium', color: { argb: COLORS.secondary } },
                    bottom: { style: 'medium', color: { argb: COLORS.secondary } },
                    right: { style: 'medium', color: { argb: COLORS.secondary } }
                }
            };
        }

        const now = new Date();

        sheet1.mergeCells("A1:R3"); 
        const titleCell = sheet1.getCell("A1");
        titleCell.value = "REPORTE DE BÁSCULA - IMPORTACIÓN CONTENERIZADA";

        titleCell.style = {
            font: styles.title?.font || { name: 'Arial', bold: true, size: 16 },
            fill: styles.title?.fill || { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } },
            border: {
                top: { style: 'thick', color: { argb: '000000' } },    
                left: { style: 'thick', color: { argb: '000000' } },
                bottom: { style: 'thick', color: { argb: '000000' } },
                right: { style: 'thick', color: { argb: '000000' } }
            },
            alignment: { 
                horizontal: 'center', 
                vertical: 'middle',
                wrapText: true 
            }
        };

        // Aplicar bordes a todas las celdas del rango A1:R3
        sheet1.eachRow((row, rowNumber) => {
            if (rowNumber >= 1 && rowNumber <= 3) {
                row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                    if (colNumber >= 1 && colNumber <= 18) { // A hasta R
                        if (!cell.style) cell.style = {};
                        cell.style.border = {
                            top: { style: 'thick', color: { argb: '000000' } },
                            bottom: { style: 'thick', color: { argb: '000000' } },
                            left: { style: 'thick', color: { argb: '000000' } },
                            right: { style: 'thick', color: { argb: '000000' } }
                        };
                    }
                });
            }
        });

        sheet1.getRow(1).height = 25;
        sheet1.getRow(2).height = 25;
        sheet1.getRow(3).height = 25;
                
        // Producto
        const productLabelCell = sheet1.getCell("A5");
        productLabelCell.value = "Producto:";
        Object.assign(productLabelCell.style, styles.dateInfo);

        const productValueCell = sheet1.getCell("B5");
        productValueCell.value = `${datosReporte[0].producto ? `${datosReporte[0].producto} - ${datosReporte[0].origen || 'N/A'}` : `N/A` }`;
        Object.assign(productValueCell.style, styles.dateInfo);

        // Proveedor
        const proveedorLabelCell = sheet1.getCell("A6");
        proveedorLabelCell.value = "Proveedor:";
        Object.assign(proveedorLabelCell.style, styles.dateInfo);

        const proveedorValueCell = sheet1.getCell("B6");
        proveedorValueCell.value = `${dataFactura?.Proveedor || 'N/A'}`;
        Object.assign(proveedorValueCell.style, styles.dateInfo);

        // Factura Sap
        const facturaLabelCell = sheet1.getCell("A7");
        facturaLabelCell.value = "Factura SAP:";
        Object.assign(facturaLabelCell.style, styles.dateInfo);

        const facturaValueCell = sheet1.getCell("B7");
        facturaValueCell.value = `${factura || 'N/A'}`;
        Object.assign(facturaValueCell.style, styles.dateInfo);

        // Factura proveedor
        const facturaProLabelCell = sheet1.getCell("A8");
        facturaProLabelCell.value = "Factura proveedor:";
        Object.assign(facturaProLabelCell.style, styles.dateInfo);

        const facturaProValueCell = sheet1.getCell("B8");
        facturaProValueCell.value = `${dataFactura?.facturaProveedor || 'N/A'}`;
        Object.assign(facturaProValueCell.style, styles.dateInfo);

        // Socio
        const socioLabelCell = sheet1.getCell("A9");
        socioLabelCell.value = "Socio:";
        Object.assign(socioLabelCell.style, styles.dateInfo);

        const socioValueCell = sheet1.getCell("B9");
        socioValueCell.value = `${statsGeneral.length > 0 ? statsGeneral[0].socio.toUpperCase() : 'N/A'}`;
        Object.assign(socioValueCell.style, styles.dateInfo);

        // Fechas (si existen datos)
        if (primeraUnidad.length > 0 && ultimaUnidad.length > 0) {
            const inicioLabelCell = sheet1.getCell("A10");
            inicioLabelCell.value = "Inicio:";
            Object.assign(inicioLabelCell.style, styles.dateInfo);

            const inicioValueCell = sheet1.getCell("B10");
            inicioValueCell.value = `${new Date(primeraUnidad[0].fechaInicio).toLocaleString()}`;
            Object.assign(inicioValueCell.style, styles.dateInfo);

            const hastaLabelCell = sheet1.getCell("A11");
            hastaLabelCell.value = "Hasta:";
            Object.assign(hastaLabelCell.style, styles.dateInfo);

            const hastaValueCell = sheet1.getCell("B11");
            hastaValueCell.value = `${new Date(ultimaUnidad[0].fechaInicio).toLocaleString()}`;
            Object.assign(hastaValueCell.style, styles.dateInfo);
        }

        // Fecha de generación
        const dateLabelCell = sheet1.getCell("A12");
        dateLabelCell.value = "Generado el:";
        Object.assign(dateLabelCell.style, styles.dateInfo);

        const dateValueCell = sheet1.getCell("B12");
        dateValueCell.value = `${now.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}`;
        Object.assign(dateValueCell.style, styles.dateInfo);

        sheet1.addRow([]);

        // ===== DETALLE DE BOLETAS CONTENERIZADAS =====
        const detalleRow = sheet1.addRow([]);
        sheet1.mergeCells(`A${sheet1.rowCount}:R${sheet1.rowCount}`);
        const detalleTitle = sheet1.getCell(`A${sheet1.rowCount}`);
        detalleTitle.value = "DETALLE DE BOLETAS CONTENERIZADAS";
        Object.assign(detalleTitle.style, styles.sectionTitle);
        
        sheet1.addRow([]);

        // Encabezados principales
        const mainHeadersUnits = [
            '', '', '', '', '', '', 
            '', '', '', '', 
            '', '', '', '',
            'UNIDAD', 'DE', 'SACOS', '',
        ];

        const headerRowUnits = sheet1.addRow(mainHeadersUnits);
        headerRowUnits.height = 25;

        sheet1.mergeCells(`O${headerRowUnits.number}:Q${headerRowUnits.number}`);

        const mergedCell = sheet1.getCell(`O${headerRowUnits.number}`);
        mergedCell.value = 'UNIDAD DE SACOS';
        Object.assign(mergedCell.style, styles.sectionTitle);


        const mainHeaders = [
            'FECHA', 'ITEM', 'BOLETA', 'PLACA', 'CONTENEDOR', 'PRECINTOS ORIGEN', 
            'SELLO OPC', 'MOTORISTA', 'ENCARGADO DE BODEGA', 'BODEGA DESCARGA', 
            'PESO NETO(QQ)', 'PESO NETO(TM)', 'ACUM. QQ', 'ACUM. TM',
            'CANTIDAD TEÓRICA', 'CANTIDAD RECIBIDA', 'CANTIDAD ACUMULADA', 'DURACIÓN',
        ];

        const headerRow = sheet1.addRow(mainHeaders);
        headerRow.height = 30;

        mainHeaders.forEach((header, index) => {
            const cell = sheet1.getCell(sheet1.rowCount, index + 1);
            Object.assign(cell.style, styles.header);
        });

        // Datos de boletas contenerizadas
        boletasContenerizadas.forEach((boleta, i) => {
            const dataRow = sheet1.addRow([
                boleta.Fecha,
                boleta.Item,
                boleta.Boleta,
                boleta.Placa,
                boleta.Contenedor,
                boleta.PrecintosOrigen,
                boleta.SelloOPC,
                boleta.Motorista,
                boleta.EncargadoBodega,
                boleta.BodegaDescarga,
                boleta.PesoNetoQQ,
                boleta.PesoNetoTM,
                boleta.AcumuladoQQ,
                boleta.AcumuladoTM,
                boleta.CantidadContenedor,
                boleta.CantidadRecibida,
                boleta.UnidadesAcumuladas, 
                boleta.TiempoBascula,
            ]);
            dataRow.height = 20;
            
            // Aplicar estilos alternados
            dataRow.eachCell((cell, colIndex) => {
                const baseStyle = i % 2 !== 0 ? {...styles.data, ...styles.alternateRow} : styles.data;
                Object.assign(cell.style, baseStyle);
                
                // Formateo específico por columna
                if (colIndex === 2) { // Item - número entero
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    cell.numFmt = '0';
                }
                
                if (colIndex === 11 || colIndex === 12) { // Peso Neto QQ y TM
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    cell.numFmt = '#,##0.00';
                }

                if (colIndex === 13 || colIndex === 14) { // Acum. QQ y TM
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    cell.numFmt = '#,##0.00';
                }

                if (colIndex === 15 || colIndex === 16 || colIndex === 17) { // Cantidades y unidades
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                    cell.numFmt = '#,##0';
                }
            });
        });

        // Configurar anchos de columna ajustados para las nuevas columnas
        const columnWidths = [
            12, 8, 12, 12, 18, 18, 12, 20, 20, 20, 
            20, 20, 20, 20, 20, 20, 18, 20
        ];
        columnWidths.forEach((width, i) => {
            sheet1.getColumn(i + 1).width = width;
        });

        // ===== RESUMEN GENERAL =====
        sheet1.addRow([]);
        sheet1.addRow([]);

        // Título principal del resumen
        const resumenMainTitleRow = sheet1.addRow([]);
        sheet1.mergeCells(`A${sheet1.rowCount}:G${sheet1.rowCount}`);
        const resumenMainTitleCell = sheet1.getCell(`A${sheet1.rowCount}`);
        resumenMainTitleCell.value = "RESUMEN GENERAL";
        resumenMainTitleCell.style = styles.header;
        sheet1.getRow(sheet1.rowCount).height = 20;

        // Información de factura y producto
        const numContenedores = [...new Set(datosReporte.map(item => item.impContenerizada?.contenedor).filter(Boolean))].length;
        const facturaInfoRow = sheet1.addRow([]);
        sheet1.mergeCells(`A${sheet1.rowCount}:G${sheet1.rowCount}`);
        const facturaInfoCell = sheet1.getCell(`A${sheet1.rowCount}`);
        facturaInfoCell.value = `FACTURA PROVEEDOR: ${dataFactura?.facturaProveedor || 'N/A'} | CONTENEDORES: ${numContenedores}`;
        facturaInfoCell.style = {
            font: { name: 'Arial', bold: true, size: 10, color: { argb: '000000' } },
            alignment: { horizontal: 'center', vertical: 'middle' },
        };
        sheet1.getRow(sheet1.rowCount).height = 20;

        sheet1.addRow([]);

        const headerRow1 = sheet1.addRow(['', 'CANTIDAD SEGÚN FACTURA', '', 'CANTIDAD RECIBIDA BÁSCULA', '', 'DIFERENCIA', '']);
        
        // Merge para los títulos principales
        sheet1.mergeCells(`B${sheet1.rowCount}:C${sheet1.rowCount}`); // CANTIDAD SEGÚN FACTURA
        sheet1.mergeCells(`D${sheet1.rowCount}:E${sheet1.rowCount}`); // CANTIDAD RECIBIDA
        sheet1.mergeCells(`F${sheet1.rowCount}:G${sheet1.rowCount}`); // DIFERENCIA
        
        ['A', 'B', 'D', 'F'].forEach(col => {
            const cell = sheet1.getCell(`${col}${sheet1.rowCount}`);
            Object.assign(cell.style, styles.header);   
        });

        sheet1.getCell(`A${sheet1.rowCount}`).value = '';
        sheet1.getCell(`B${sheet1.rowCount}`).value = 'CANTIDAD SEGÚN FACTURA';
        sheet1.getCell(`D${sheet1.rowCount}`).value = 'CANTIDAD RECIBIDA SEGÚN BÁSCULA';
        sheet1.getCell(`F${sheet1.rowCount}`).value = 'DIFERENCIA SEGÚN PESO BÁSCULA';

        sheet1.getRow(sheet1.rowCount).height = 35;
        
        // Subencabezados - segunda fila
        const headerRow2 = sheet1.addRow(['', 'TM', 'QQ', 'TM', 'QQ', 'TM', 'QQ']);
        headerRow2.eachCell((cell, colIndex) => {
            if (colIndex <= 7) {
                cell.style = {
                    font: { name: "Calibri", size: 11, color: { argb: COLORS.text } },
                    alignment: { vertical: "middle", horizontal: "center" },
                    border: {
                        top: { style: "thin", color: { argb: COLORS.darkGray } },
                        left: { style: "thin", color: { argb: COLORS.darkGray } },
                        bottom: { style: "thin", color: { argb: COLORS.darkGray } },
                        right: { style: "thin", color: { argb: COLORS.darkGray } },
                    },
                };
            }
        });

        // Datos del resumen
        const dataRow = sheet1.addRow([
            'TOTALES',
            parseFloat(resumenGeneral.factura.toneladaMetrica),
            parseFloat(resumenGeneral.factura.quintales),
            parseFloat(resumenGeneral.bascula.toneladaMetrica),
            parseFloat(resumenGeneral.bascula.quintales),
            parseFloat(resumenGeneral.diferencias.toneladaMetrica),
            parseFloat(resumenGeneral.diferencias.quintales)
        ]);

        dataRow.eachCell((cell, colIndex) => {
            if (colIndex <= 7) {
                let baseStyle = {
                    font: { name: 'Arial', bold: colIndex === 1, size: 11 },
                    alignment: { horizontal: colIndex === 1 ? 'left' : 'center', vertical: 'middle' },
                };

                let foramatInit = {
                    border: {
                        top: { style: "thin", color: { argb: COLORS.darkGray } },
                        left: { style: "thin", color: { argb: COLORS.darkGray } },
                        bottom: { style: "thin", color: { argb: COLORS.darkGray } },
                        right: { style: "thin", color: { argb: COLORS.darkGray } },
                    },
                }

                // Formato numérico para columnas de datos
                if (colIndex > 1) {
                    baseStyle.numFmt = '#,##0.00';
                }

                // Color de fondo para las diferencias
                if (colIndex === 6 || colIndex === 7) {
                    const valor = parseFloat(cell.value);
                    if (valor > 0) {
                        baseStyle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C6EFCE' } }; // Verde claro
                        baseStyle.font.color = { argb: '006100' }; // Verde oscuro
                    } else if (valor < 0) {
                        baseStyle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC7CE' } }; // Rojo claro
                        baseStyle.font.color = { argb: '9C0006' }; // Rojo oscuro
                    } else {
                        baseStyle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } }; // Blanco
                    }
                } else if (colIndex === 1) {
                    baseStyle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } }; // Gris claro
                } else {
                    baseStyle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } }; // Blanco
                }

                cell.style = {...baseStyle, ...foramatInit};
            }
        });

        sheet1.getRow(sheet1.rowCount).height = 25;

        sheet1.addRow([]); // Espacio

        // Información adicional en una sola fila organizada
        const infoAdicionalRow = sheet1.addRow([]);
        sheet1.mergeCells(`A${sheet1.rowCount}:D${sheet1.rowCount}`);
        sheet1.mergeCells(`E${sheet1.rowCount}:G${sheet1.rowCount}`);

        const sacosCell = sheet1.getCell(`A${sheet1.rowCount}`);
        sacosCell.value = `CANTIDAD DESACOS RECIBIDOS: ${acumuladoUnidades.toLocaleString()} Unidades`;
        sacosCell.style = {
            font: { name: 'Arial', bold: true, size: 12 },
            alignment: { horizontal: 'left', vertical: 'middle' },
        };

        const estadoCell = sheet1.getCell(`E${sheet1.rowCount}`);
        const diferenciaTM = parseFloat(resumenGeneral.diferencias.toneladaMetrica);
        const estadoTexto = diferenciaTM > 0 ? 'SOBRANTE' : diferenciaTM < 0 ? 'FALTANTE' : 'EXACTO';
        estadoCell.value = `RESULTADO: ${estadoTexto}`;
        estadoCell.style = {
            font: { name: 'Arial', bold: true, size: 12, color: { argb: 'FFFFFF' } },
            fill: { 
                type: 'pattern', 
                pattern: 'solid', 
                fgColor: { 
                    argb: diferenciaTM > 0 ? '70AD47' : diferenciaTM < 0 ? 'C5504B' : '4472C4' 
                } 
            },
            alignment: { horizontal: 'center', vertical: 'middle' },
        };

        sheet1.getRow(sheet1.rowCount).height = 30;

        // Ajustar anchos de las primeras columnas para el resumen
        sheet1.getColumn(1).width = 25; // CONCEPTO
        sheet1.getColumn(2).width = 15; // TM Factura
        sheet1.getColumn(3).width = 15; // QQ Factura
        sheet1.getColumn(4).width = 15; // TM Báscula
        sheet1.getColumn(5).width = 15; // QQ Báscula
        sheet1.getColumn(6).width = 15; // TM Diferencia
        sheet1.getColumn(7).width = 15; // QQ Diferencia

        // Pie de página
        sheet1.addRow([]);
        sheet1.addRow([]);
        const footerRowNum = sheet1.rowCount + 1;
        sheet1.mergeCells(`A${footerRowNum}:R${footerRowNum}`);
        const footerCell = sheet1.getCell(`A${footerRowNum}`);
        footerCell.value = 'BENEFICIO DE ARROZ PROGRESO, S.A. DE C.V. © ' + new Date().getFullYear();
        Object.assign(footerCell.style, styles.footer);

        /* Proteger Excel */
        sheet1.protect('baprosa', { formatCells: false, formatColumns: false });

        // Configurar la respuesta para descargar el archivo Excel
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="reporte_contenerizada_${factura || 'sin_factura'}_${new Date().toISOString().split('T')[0]}.xlsx"`);
        
        setLogger('REPORTES', `CREO REPORTE DE IMPORTACIÓN CONTENEDORIZADA DE ${statsGeneral[0].socio.toUpperCase()} - SAP ${factura} `, req, null, 1, null);

        // Escribir el archivo Excel a la respuesta
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error en getReportContenerizada:', error);
        setLogger('REPORTES', 'EN GENERAR REPORTE DE CONTENEDORIZADA', req, null, 3);

        return res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/* Parte de casulla */

const getBoletasCasulla = async (req, res) => {
    try{
        const dateIn = req.query.dateIn || null;
        const dateOut = req.query.dateOut || null;

        const CASULLA = 11

        const fechasValidas = dateIn && dateOut && 
                            dateIn !== "undefined" && dateOut !== "undefined" && 
                            dateIn !== "null" && dateOut !== "null" && 
                            dateIn.trim() !== "" && dateOut.trim() !== "";
                            
        if (fechasValidas) {
            const [y1, m1, d1] = dateIn.split("-").map(Number);
            startOfDay = new Date(Date.UTC(y1, m1 - 1, d1, 6, 0, 0));
            const [y2, m2, d2] = dateOut.split("-").map(Number);
            endOfDay = new Date(Date.UTC(y2, m2 - 1, d2 + 1, 6, 0, 0));
        }

        const casulla = await db.boleta.groupBy({
            by: ['destino', 'socio'],
            _count: {
                _all: true 
            },
            _sum: {
                pesoNeto: true  
            },
            where: {
                idProducto: CASULLA,
                id: {
                    not: {
                        in: [2] /* Dato creado de prueba testing comoding */
                    }  
                },
                estado: {
                    not: {
                        in: ['Pendiente', 'Cancelada'],
                    },
                },
                destino: {
                    not: null  
                },
                ...(fechasValidas ? { fechaFin: { gte: startOfDay, lte: endOfDay } } : {}),
            },
            orderBy: {
                destino: 'asc'  
            },
        });

        let totalViajes = 0;
        let tototalLb = 0;
        let tototalQq = 0;
        let tototalTm = 0;
        let percentAll = 0;

        const casulaFormatted = casulla.map(item => {
            const pesoNetoLb = item._sum.pesoNeto || 0;
            
            const pesoNetoQq = pesoNetoLb / 100;
            const pesoNetoTm = pesoNetoLb / 2204.62;
            
            tototalLb += pesoNetoLb;
            tototalQq += pesoNetoQq;
            tototalTm += pesoNetoTm;
            totalViajes += item._count._all;

            return {
                socio: item.socio,
                destino: item.destino,
                viajes: item._count._all,
                totalLb: pesoNetoLb,
                totalQq: pesoNetoQq,
                totalTm: pesoNetoTm,
                porcentaje: null // Se calcula después
            };
        });

        const totalBoletas = casulaFormatted.reduce((sum, item) => sum + item.viajes, 0);
        const casulaWithPercentage = casulaFormatted.map(item => ({
            ...item,
            porcentaje: ((item.viajes / totalBoletas) * 100).toFixed(2)
        }));

        const totalPesoLb = casulaFormatted.reduce((sum, item) => sum + item.totalLb, 0);
        const casulaWithPesoPercentage = casulaWithPercentage.map(item => ({
            Socio: item.socio,
            Destino: item.destino,
            Viajes: item.viajes,
            "Total(lb)": `${item.totalLb} lb`,
            "Total(qq)": `${item.totalQq.toFixed(2)} qq`,
            "Total(tm)": `${item.totalTm.toFixed(2)} tm`,
            "Porcentaje": `${((item.totalLb / totalPesoLb) * 100).toFixed(3)} %`,
            /* porcentajeViajes: `${item.porcentaje} %` */ /* Lo quieto porque es irrelevante y podria confundir */
        }));

        

        res.status(200).json({
            data: casulaWithPesoPercentage,
            total: [{
                Tolal: 'Total',
                Viajes: totalViajes.toLocaleString('en-US'),
                totalPesoLb: `${totalPesoLb.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} lb`, 
                totalPesoQq: `${tototalQq.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} qq`, 
                totalPesoTm: `${tototalTm.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} tm`
            }]
        })

    }catch(err){
        console.log(err)
    }
}

const getBoletasCasullaDetalleSocio = async (req, res) => {
    try {
        const socio = req.query.socio; 
        const destino = req.query.destino;
        const dateIn = req.query.dateIn || null;
        const dateOut = req.query.dateOut || null;

        const CASULLA = 11;

        if (!socio || !destino) {
            return res.status(400).json({
                error: 'El parámetro es requerido'
            });
        }

        const fechasValidas = dateIn && dateOut && 
                            dateIn !== "undefined" && dateOut !== "undefined" && 
                            dateIn !== "null" && dateOut !== "null" && 
                            dateIn.trim() !== "" && dateOut.trim() !== "";
                            
        if (fechasValidas) {
            const [y1, m1, d1] = dateIn.split("-").map(Number);
            startOfDay = new Date(Date.UTC(y1, m1 - 1, d1, 6, 0, 0));
            const [y2, m2, d2] = dateOut.split("-").map(Number);
            endOfDay = new Date(Date.UTC(y2, m2 - 1, d2 + 1, 6, 0, 0));
        }

        const boletasSocio = await db.boleta.findMany({
            select: {
                numBoleta: true,
                socio: true,
                motorista: true,
                placa: true,
                pesoNeto: true,
                fechaFin: true,   
            }, 
            where: {
                idProducto: CASULLA,
                socio: socio,
                destino: {
                    equals: destino, 
                    not: null
                },
                ...(fechasValidas ? { fechaFin: { gte: startOfDay, lte: endOfDay } } : {}),
            },
            orderBy: {
                fechaFin: 'desc' 
            }
        });

        const refactorData =  boletasSocio.map((item) => ({
            ...item,
            fechaFin: new Date(item.fechaFin).toLocaleDateString('es-ES')
        }))

        res.status(200).json(refactorData);

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: 'Error interno del servidor'
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
    getRerportContenerizada,
    getBoletasCasulla,
    getBoletasCasullaDetalleSocio 
}