const db = require("../lib/prisma");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { QUINTALTONELADA, GRANZA, IMPORTACIONES } = require("../utils/variablesInformes");
const ExcelJS = require('exceljs');

const buquesBoletas = async(req, res) => {
    try{
        const resultado = await db.boleta.groupBy({
            by: ['socio', 'idSocio'], 
            where:{
                idMovimiento: IMPORTACIONES, 
                idProducto: GRANZA,
                estado:{
                    not: {
                        in: ['Pendiente', 'Cancelada'],
                    },
                }
            },
            orderBy:{
                idSocio: 'asc'
            } 
        })
        res.send(resultado)
    }catch(err){
        console.log(err)
    }
}

const getResumenBFH = async(req, res) => {
    try{
        const buque = req.query.buque || null;
        
        const rawData = await db.boleta.findMany({
            where: {
                idMovimiento: IMPORTACIONES, 
                idProducto: GRANZA,
                idSocio: parseInt(buque), 
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
        if(result.length==0) return res.status(200).send([{
            socio: 'No seleccionado',
            fecha: 'No seleccionado', 
            total: 'No seleccionado', 
            pesoNeto: 'No seleccionado',
            pesoTeorico: 'No seleccionado',
            desviacion: 'No seleccionado',  
        }])
        return res.status(200).send(result);
    } catch(err) {
        console.log(err);
        res.status(500).send({ error: 'Error interno del servidor' });
    }
}

const getBuqueStats = async(req, res) => {
    try{
        const buque = req.query.buque || null;
        const total = await db.boleta.groupBy({
            by: ['idSocio'],
            where: {
                idSocio: parseInt(buque), 
                estado: {
                    not: {
                        in: ['Pendiente', 'Cancelada'],
                    },
                }, 
                idMovimiento: IMPORTACIONES, 
                idProducto: GRANZA,
            }, 
            _sum:{
                pesoNeto: true, 
                pesoTeorico: true, 
                desviacion: true,
            }
        })
        if(total.length==0) return res.status(200).send({err: 'Buque no seleecionado'})
        const {_sum} = total[0]
        const refactorData = {
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

const getBuqueDetalles = async(req, res) =>{
    try{
        const buque = req.query.buque || null;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if(!buque || buque===undefined) return res.status(200).send({
            data: [{
                Nviajes: 'No seleccionado',
                pesoTeorico: 'No seleccionado', 
                pesoNeto: 'No seleccionado',
                desviacion: 'No seleccionado', 
            }],
            pagination: {
                totalData: 1,
                totalPages: 1,
                currentPage: 1,
                limit:1,
            },
        })
        
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

        const [data, totalData] = await Promise.all([
            db.boleta.findMany({
            select:{
                Nviajes: true,
                pesoTeorico:true, 
                pesoNeto: true,
                desviacion:true,
                bodegaPuerto: true, 
            }, 
            where, 
            orderBy:{
                Nviajes: 'asc',
            },
            skip,
            take: limit,
            }), 
            db.boleta.count({where})
        ])

        if(data.length==0) return res.status(200).send(
            {
                data: [{
                    Nviajes: 'No seleccionado',
                    pesoTeorico: 'No seleccionado', 
                    pesoNeto: 'No seleccionado',
                    desviacion: 'No seleccionado', 
                }],
                pagination: {
                    totalData: 1,
                    totalPages: 1,
                    currentPage: 1,
                    limit:1,
                },
            }
        )

        return res.send({
            data: data,
            pagination: {
                totalData,
                totalPages: Math.ceil(totalData / limit),
                currentPage: page,
                limit,
            },
        });
    }catch(err) {
        console.log(err)
    }
}

const exportR1Importaciones =  async(req, res) => {
    try{
        const buque = req.query.buque || null;
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
        // Obtener datos del resumen BFH
        const rawData = await db.boleta.findMany({
            where,
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
        const buqueDetalles = await db.boleta.findMany({
            where,
            select:{
                numBoleta: true,
                Nviajes: true,
                pesoTeorico:true, 
                pesoNeto: true,
                desviacion:true,
                bodegaPuerto: true, 
            }, 
            orderBy:{
                Nviajes: 'asc',
            },
        });
        
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
        sheet1.mergeCells("B1:I1");
        const titleCell = sheet1.getCell("B1");
        titleCell.value = "BAPROSA - Sistema de Gestión de Básculas";
        Object.assign(titleCell.style, styles.title);
        
        sheet1.mergeCells("B2:I2");
        const subtitleCell = sheet1.getCell("B2");
        subtitleCell.value = "RESUMEN BFH - IMPORTACIONES DE GRANZA";
        Object.assign(subtitleCell.style, styles.subtitle);
        
        sheet1.mergeCells("B3:I3");
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
        
        // ===== SECCIÓN 1: RESUMEN POR FECHAS =====
        sheet1.mergeCells(`A${sheet1.rowCount + 1}:F${sheet1.rowCount + 1}`);
        const summarySection = sheet1.getCell(`A${sheet1.rowCount}`);
        summarySection.value = "RESUMEN POR FECHAS";
        Object.assign(summarySection.style, styles.sectionTitle);
        
        sheet1.addRow([]);
        
        // Encabezados de columnas para resumen
        const headers = ['Socio', 'Fecha', 'Total', 'Peso Neto', 'Peso Teórico', 'Desviación'];
        const headerRow = sheet1.addRow(headers);
        headerRow.height = 30;
        headerRow.eachCell((cell) => {
            Object.assign(cell.style, styles.header);
        });
        
        // Configuración de anchos de columna
        const columnWidths = [30, 15, 10, 20, 20, 20];
        columnWidths.forEach((width, i) => {
            sheet1.getColumn(i + 1).width = width;
        });

        // Agregar datos del resumen
        let totalRecords = 0;
        let totalPesoNeto = 0;
        let totalPesoTeorico = 0;
        let totalDesviacion = 0;

        result.forEach((item, index) => {
            const dataRow = sheet1.addRow([
                item.socio,
                item.fecha,
                item.total,
                item.pesoNeto,
                item.pesoTeorico,
                item.desviacion
            ]);
            dataRow.height = 22;
            
            // Actualizar totales si los datos son numéricos
            if (typeof item.total === 'number') {
                totalRecords += item.total;
                totalPesoNeto += item.pesoNeto;
                totalPesoTeorico += item.pesoTeorico;
                totalDesviacion += item.desviacion;
            }
            
            // Aplicar estilo alternado
            if (index % 2 !== 0) {
                dataRow.eachCell((cell) => {
                    cell.style = {...styles.data, ...styles.alternateRow};
                });
            } else {
                dataRow.eachCell((cell) => {
                    Object.assign(cell.style, styles.data);
                });
            }
            
            // Formato para valores numéricos
            if (typeof item.pesoNeto === 'number') {
                const pesoNetoCell = dataRow.getCell(4);
                pesoNetoCell.numFmt = '#,##0.00 "lb"';
                pesoNetoCell.alignment = { horizontal: 'right', vertical: 'middle' };

                const pesoTeoricoCell = dataRow.getCell(5);
                pesoTeoricoCell.numFmt = '#,##0.00 "lb"';
                pesoTeoricoCell.alignment = { horizontal: 'right', vertical: 'middle' };

                const desviacionCell = dataRow.getCell(6);
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
            dataRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' }; // Fecha
            dataRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' }; // Total
        });

        // Agregar totales solo si hay datos numéricos
        if (typeof result[0]?.total === 'number') {
            sheet1.addRow([]);
            const totalsRow = sheet1.addRow(['', 'TOTALES:', totalRecords, totalPesoNeto.toFixed(2), totalPesoTeorico.toFixed(2), totalDesviacion.toFixed(2)]);
            totalsRow.getCell(2).style = styles.summary;
            totalsRow.getCell(3).style = styles.summaryValue;
            totalsRow.getCell(4).style = styles.summaryValue;
            totalsRow.getCell(5).style = styles.summaryValue;
            totalsRow.getCell(6).style = styles.summaryValue;
        }

        // ===== SECCIÓN 2: DETALLES POR VIAJE =====
        sheet1.addRow([]);
        sheet1.addRow([]);
        
        sheet1.mergeCells(`H6:L6`);
        const detailsSection = sheet1.getCell(`H6`);
        detailsSection.value = "DETALLES POR VIAJE";
        Object.assign(detailsSection.style, styles.sectionTitle);
        
        sheet1.addRow([]);
        
        // Encabezados de columnas para detalles
        const detailHeaders = ['N° Viaje', 'Peso Teórico', 'Peso Neto', 'Desviación', 'Bodega Puerto'];
        const detailHeaderRow = sheet1.addRow(detailHeaders);
        detailHeaderRow.height = 30;
        detailHeaderRow.eachCell((cell) => {
            Object.assign(cell.style, styles.header);
        });
        
        // Configuración de anchos de columna para la sección de detalles
        const detailColumnWidths = [20, 20, 20, 20, 25];
        detailColumnWidths.forEach((width, i) => {
            sheet1.getColumn(i + 1).width = Math.max(sheet1.getColumn(i + 1).width, width);
        });

        // Agregar datos de detalles del buque
        let detailTotalPesoNeto = 0;
        let detailTotalPesoTeorico = 0;
        let detailTotalDesviacion = 0;

        buqueDetalles.forEach((item, index) => {
            const dataRow = sheet1.addRow([
                item.Nviajes,
                item.pesoTeorico,
                item.pesoNeto,
                item.desviacion,
                item.bodegaPuerto
            ]);
            dataRow.height = 22;
            
            // Actualizar totales si los datos son numéricos
            if (typeof item.pesoNeto === 'number') {
                detailTotalPesoNeto += item.pesoNeto;
                detailTotalPesoTeorico += item.pesoTeorico;
                detailTotalDesviacion += item.desviacion;
            }
            
            // Aplicar estilo alternado
            if (index % 2 !== 0) {
                dataRow.eachCell((cell) => {
                    cell.style = {...styles.data, ...styles.alternateRow};
                });
            } else {
                dataRow.eachCell((cell) => {
                    Object.assign(cell.style, styles.data);
                });
            }
            
            // Formato para valores numéricos
            if (typeof item.pesoNeto === 'number') {
                const pesoNetoCell = dataRow.getCell(3);
                pesoNetoCell.numFmt = '#,##0.00 "lb"';
                pesoNetoCell.alignment = { horizontal: 'right', vertical: 'middle' };

                const pesoTeoricoCell = dataRow.getCell(2);
                pesoTeoricoCell.numFmt = '#,##0.00 "lb"';
                pesoTeoricoCell.alignment = { horizontal: 'right', vertical: 'middle' };

                const desviacionCell = dataRow.getCell(4);
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
            dataRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }; // N° Viaje
            dataRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' }; // Bodega Puerto
        });

        // Agregar totales de detalles solo si hay datos numéricos
        if (typeof buqueDetalles[0]?.pesoNeto === 'number') {
            sheet1.addRow([]);
            const detailTotalsRow = sheet1.addRow(['TOTALES:', detailTotalPesoTeorico.toFixed(2), detailTotalPesoNeto.toFixed(2), detailTotalDesviacion.toFixed(2), '']);
            detailTotalsRow.getCell(1).style = styles.summary;
            detailTotalsRow.getCell(2).style = styles.summaryValue;
            detailTotalsRow.getCell(3).style = styles.summaryValue;
            detailTotalsRow.getCell(4).style = styles.summaryValue;
            detailTotalsRow.getCell(5).style = styles.summaryValue;
        }

        // Pie de página
        sheet1.addRow([]);
        sheet1.addRow([]);
        const footerRow = sheet1.rowCount + 1;
        sheet1.mergeCells(`A${footerRow}:I${footerRow}`);
        const footerCell = sheet1.getCell(`A${footerRow}`);
        footerCell.value = 'BAPROSA - Sistema de Gestión de Básculas © ' + new Date().getFullYear();
        Object.assign(footerCell.style, styles.footer);

        // ===== HOJA 2: ANÁLISIS (EN BLANCO) =====
        const sheet2 = workbook.addWorksheet('Detalles', {
            properties: { tabColor: {argb: COLORS.secondary} }
        });
        
        // Encabezado de la hoja de análisis
        sheet2.mergeCells("A1:F1");
        const analysisTitle = sheet2.getCell("A1");
        analysisTitle.value = "ANÁLISIS DE DATOS BFH";
        analysisTitle.style = {
            font: { name: 'Calibri', bold: true, size: 16, color: { argb: COLORS.primary } },
            alignment: { horizontal: 'center', vertical: 'middle' },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.light } },
            border: { outline: { style: 'thin', color: { argb: COLORS.primary } } }
        };
        
        sheet2.getRow(3).values = ['Esta hoja está disponible para análisis personalizado de los datos BFH'];
        sheet2.getCell('A3').style = {
            font: { name: 'Calibri', italic: true, size: 12, color: { argb: COLORS.lightText } },
            alignment: { horizontal: 'left', vertical: 'middle' }
        };
        
        // Configurar anchos de columna
        for (let i = 1; i <= 6; i++) {
            sheet2.getColumn(i).width = 20;
        }

        // ===== HOJA 3: GRÁFICOS (EN BLANCO) =====
        const sheet3 = workbook.addWorksheet('Placas', {
            properties: { tabColor: {argb: COLORS.accent} }
        });
        
        sheet3.mergeCells("A1:F1");
        const chartsTitle = sheet3.getCell("A1");
        chartsTitle.value = "GRÁFICOS Y VISUALIZACIONES";
        chartsTitle.style = {
            font: { name: 'Calibri', bold: true, size: 16, color: { argb: COLORS.primary } },
            alignment: { horizontal: 'center', vertical: 'middle' },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.light } },
            border: { outline: { style: 'thin', color: { argb: COLORS.primary } } }
        };
        
        sheet3.getRow(3).values = ['Esta hoja está disponible para gráficos y visualizaciones de datos'];
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
        notesTitle.value = "NOTAS Y OBSERVACIONES";
        notesTitle.style = {
            font: { name: 'Calibri', bold: true, size: 16, color: { argb: COLORS.primary } },
            alignment: { horizontal: 'center', vertical: 'middle' },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.light } },
            border: { outline: { style: 'thin', color: { argb: COLORS.primary } } }
        };
        
        sheet4.getRow(3).values = ['Esta hoja está disponible para notas y observaciones sobre el reporte'];
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
}