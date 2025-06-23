/* const db = require("../lib/prisma"); */
const ExcelJS = require("exceljs");
const { PrismaClient } = require('@prisma/client');
const e = require("express");
const db = new PrismaClient();

const exportToExcel = async (req, res) => {
  try {
    const dateIn = req.query.dateIn;
    const dateOut = req.query.dateOut;
    const producto = req.query.producto || null;
    const movimiento = req.query.movimiento || null;
    const socio = req.query.socio || null;

    const [y1, m1, d1] = dateIn.split("-").map(Number);
    const startOfDay = new Date(Date.UTC(y1, m1 - 1, d1, 6, 0, 0));
    const [y2, m2, d2] = dateOut.split("-").map(Number);
    const endOfDay = new Date(Date.UTC(y2, m2 - 1, d2 + 1, 6, 0, 0));

    const data = await db.boleta.findMany({
      where: {
        fechaFin: { gte: startOfDay, lte: endOfDay },
        AND: [{estado: {not: "Pendiente"}}, {estado: {not: "Cancelada"}}],
        ...(movimiento ? { movimiento: movimiento } : {}),
        ...(producto ? { producto: producto } : {}),
        ...(socio ? {socio : socio} : {})
      },
    });

    // Verificación de datos
    if (!data || data.length === 0) 
      return res.status(404).json({ error: "No se encontraron registros para exportar" });

    /**
     * Aqui se ocupa cambiar cuando se implemente la ventana de JAVI
     */
    const boletas = data.map((el) => {
      const fechaInicio = el.fechaInicio ? new Date(el.fechaInicio) : null;
      const fechaFin = el.fechaFin ? new Date(el.fechaFin) : null;

      const diferenciaMs = fechaInicio && fechaFin ? fechaFin - fechaInicio : null;

      const isEspecialTraslado = el.proceso === 0 && (el.idMovimiento===10 || el.idMovimiento===11)


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
        Producto: el.producto,
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
      };
    });

    // Creación del libro y hoja
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
    
    const sheet = workbook.addWorksheet("Reporte de Boletas", {
      pageSetup: {
        paperSize: 9, // A4
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        printArea: 'A1:M100',
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

    // Estilos generales
    const styles = {
      title: {
        font: { name: 'Calibri', bold: true, size: 20, color: { argb: COLORS.primary } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: {
          bottom: { style: 'medium', color: { argb: COLORS.primary } }
        }
      },
      
      subtitle: {
        font: { name: 'Calibri', bold: true, size: 16, color: { argb: COLORS.secondary } },
        alignment: { horizontal: 'center', vertical: 'middle' }
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
      
      footer: {
        font: { name: 'Calibri', italic: true, size: 10, color: { argb: COLORS.lightText } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: {
          top: { style: 'thin', color: { argb: COLORS.primary } }
        }
      },
      
      summary: {
        font: { name: 'Calibri', bold: true, size: 12, color: { argb: COLORS.primary } },
        alignment: { horizontal: 'right', vertical: 'middle' },
        border: {
          top: { style: 'medium', color: { argb: COLORS.primary } }
        }
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
      }
    };

    // Logo
    try {
      const logoId = workbook.addImage({
        filename: "logo.png",
        extension: "png",
      });
      sheet.addImage(logoId, {
        tl: { col: 0, row: 0 },
        br: { col: 2, row: 4 },
        editAs: 'oneCell'
      });
    } catch (error) {
      console.log("Logo no disponible:", error.message);
      // Crear un marcador de posición para el logo si no está disponible
      sheet.mergeCells("A1:B4");
      const placeholderCell = sheet.getCell("A1");
      placeholderCell.value = "BAPROSA";
      placeholderCell.style = {
        font: { name: 'Arial', bold: true, size: 24, color: { argb: COLORS.primary } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: { outline: { style: 'medium', color: { argb: COLORS.primary } } }
      };
    }

    // Encabezado del reporte
    sheet.mergeCells("C1:K1");
    const titleCell = sheet.getCell("C1");
    titleCell.value = "BÁSCULAS Y PROCESOS S.A.";
    Object.assign(titleCell.style, styles.title);
    
    sheet.mergeCells("C2:K2");
    const subtitleCell = sheet.getCell("C2");
    subtitleCell.value = `REPORTE DE BOLETAS DE PESO ${dateIn} - ${dateOut}` + (producto ? ` DE: ${producto}` : '') + (movimiento ? ` DE: ${movimiento}` : '');
    Object.assign(subtitleCell.style, styles.subtitle);
    
    sheet.mergeCells("C3:K3");
    const dateCell = sheet.getCell("C3");
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

    // Espacio antes de la tabla de datos
    sheet.addRow([]);
    
    // Encabezados de columnas
    const headerRow = sheet.addRow(Object.keys(boletas[0]));
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      Object.assign(cell.style, styles.header);
    });
    
    // Configuración de anchos de columna optimizados
    const columnWidths = [
      { header: 'Boleta', width: 10 },
      { header: 'Proceso', width: 12 },
      { header: 'Placa', width: 15 },
      { header: 'Cliente', width: 30 },
      { header: 'Transporte', width: 30 },
      { header: 'Motorista', width: 30 },
      { header: 'Producto', width: 30 },
      { header: 'Origen', width: 20 },
      { header: 'Destino', width: 20 },
      { header: 'Tara', width: 20 },
      { header: 'PesoBruto', width: 20 },
      { header: 'PesoNeto', width: 12 },
      { header: 'PesoTeorico', width: 14 },
      { header: 'Desviación', width: 12 },
      { header: 'Tolerado', width: 14 },
      { header: 'Estado', width: 30 },
      { header: 'FechaDeEntrada', width: 20 },
      { header: 'FechaFinalizacion', width: 20 },
      { header: 'TiempoTotal', width: 20 }
    ];
    
    columnWidths.forEach((col, i) => {
      sheet.getColumn(i + 1).width = col.width;
    });

    // Añadir datos
    let totalPesoNeto = 0;
    let totalPesoTeorico = 0;
    let totalDesviacion = 0;
    let countCompletado = 0;
    let countFueraTol = 0;
    let countOtros = 0;
    let tara = 0
    let pesoBruto = 0

    console.log(boletas)
    boletas.forEach((boleta, index) => {
      const dataRow = sheet.addRow(Object.values(boleta));
      dataRow.height = 22;
      
      // Actualizar totales
      totalPesoNeto += parseFloat(boleta.PesoNeto) || 0;
      totalPesoTeorico += parseFloat(boleta.PesoTeorico) || 0;
      totalDesviacion += parseFloat(boleta.Desviación) || 0;
      tara += (boleta.estado=='Cancelada' ? 0 : parseFloat(boleta.Tara)) || 0;
      pesoBruto += (boleta.estado=='Cancelada' ? 0:parseFloat(boleta.PesoBruto)) || 0;

      
      // Contar estados
      switch (boleta.Estado) {
        case 'Completado':
          countCompletado++;
          break;
        case 'Completo(Fuera de tolerancia)':
          countFueraTol++;
          break;
        default:
          countOtros++;
      }
      
      // Aplicar estilo alternado a las filas
      if (index % 2 !== 0) {
        dataRow.eachCell((cell) => {
          cell.style = {...styles.data, ...styles.alternateRow};
        });
      } else {
        dataRow.eachCell((cell) => {
          Object.assign(cell.style, styles.data);
        });
      }
      
      // Formato especial para ciertas columnas
      const procesoCell = dataRow.getCell(2);
      if (procesoCell.value === 'Entrada') {
        procesoCell.font = { name: 'Calibri', size: 11, color: { argb: COLORS.white } };
        procesoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.secondary } };
      } else {
        procesoCell.font = { name: 'Calibri', size: 11, color: { argb: COLORS.white } };
        procesoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.accent } };
      }
      procesoCell.alignment = { horizontal: 'center', vertical: 'middle' };
      
      // Formato para valores numéricos
      
      const pesoTaraCell = dataRow.getCell(10); 
      pesoTaraCell.numFmt = '#,##0.00 "lb"';
      pesoTaraCell.alignment = { horizontal: 'right', vertical: 'middle' };

      const pesoBrutoCell = dataRow.getCell(11); 
      pesoBrutoCell.numFmt = '#,##0.00 "lb"';
      pesoBrutoCell.alignment = { horizontal: 'right', vertical: 'middle' };

      const pesoNetoCell = dataRow.getCell(12); 
      pesoNetoCell.numFmt = '#,##0.00 "lb"';
      pesoNetoCell.alignment = { horizontal: 'right', vertical: 'middle' };

      const pesoTeoricoCell = dataRow.getCell(13); 
      pesoTeoricoCell.numFmt = '#,##0.00 "lb"';
      pesoTeoricoCell.alignment = { horizontal: 'right', vertical: 'middle' };

      const desviacionCell = dataRow.getCell(14);
      desviacionCell.numFmt = '#,##0.00 "lb"';
      desviacionCell.alignment = { horizontal: 'right', vertical: 'middle' };

      const toleranciaCell = dataRow.getCell(15); 
      toleranciaCell.numFmt = '#,##0.00 "lb"';
      toleranciaCell.alignment = { horizontal: 'right', vertical: 'middle' };
      
      // Colorear desviación según su valor
      const desviacionValue = parseFloat(boleta.Desviación) || 0;
      if (desviacionValue > -100 && desviacionValue<100) {
        desviacionCell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.success } };
      } else if (desviacionValue < -100 || desviacionValue > 100) {
        desviacionCell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.danger } };
      }
      
      // Colorear estado según su valor
      const estadoCell = dataRow.getCell(16);
      estadoCell.alignment = { horizontal: 'center', vertical: 'middle' };
      
      switch (estadoCell.value) {
        case 'Completado':
          estadoCell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.white } };
          estadoCell.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.success } };
          break;
        case 'Completo(Fuera de tolerancia)':
          estadoCell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.white } };
          estadoCell.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.danger } };
          break;
        default:
          estadoCell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.white } };
          estadoCell.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.warning } };
      }
      
      // Formato para fechas
      const fechaIncial = dataRow.getCell(17);
      fechaIncial.alignment = { horizontal: 'center', vertical: 'middle' };
      const fechaFinaCell = dataRow.getCell(18);
      fechaFinaCell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Añadir pie de página con información de totales
    sheet.addRow([]);
    
    const summaryStartRow = sheet.rowCount + 1;
    
    // Totales de pesos
    sheet.addRow(['', '', '', '', '', '', '', '','TOTALES:', tara.toFixed(2), pesoBruto.toFixed(2),totalPesoNeto.toFixed(2), 
                  totalPesoTeorico.toFixed(2), totalDesviacion.toFixed(2) ]);
    const totalsRow = sheet.lastRow;
    totalsRow.getCell(9).style = styles.summary;
    totalsRow.getCell(10).style = styles.summaryValue;
    totalsRow.getCell(11).style = styles.summaryValue;
    totalsRow.getCell(12).style = styles.summaryValue;
    totalsRow.getCell(13).style = styles.summaryValue;
    totalsRow.getCell(14).style = styles.summaryValue;
    
    // Resumen de estados
    sheet.addRow(['', '', '', '', '', '', '', '','RESUMEN DE ESTADOS:', '', '', '']);
    const statesHeaderRow = sheet.lastRow;
    statesHeaderRow.getCell(9).style = styles.summary;
    
    // Crear una tabla pequeña con los conteos de estados
    sheet.addRow(['', '', '', '', '', '', '','','Completados:', countCompletado, '', '']);
    sheet.addRow(['', '', '', '', '', '', '','','Fuera de tolerancia:', countFueraTol, '', '']);
    sheet.addRow(['', '', '', '', '', '', '','','Otros estados:', countOtros, '', '']);
    sheet.addRow(['', '', '', '', '', '', '','','Total de registros:', boletas.length, '', '']);
    
    // Dar formato a la tabla de resumen
    for (let i = 0; i < 4; i++) {
      const row = sheet.getRow(statesHeaderRow.number + 1 + i);
      row.getCell(9).style = {
        font: { name: 'Calibri', size: 11, color: { argb: COLORS.text } },
        alignment: { horizontal: 'right', vertical: 'middle' }
      };
      row.getCell(10).style = {
        font: { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.text } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.light } },
        border: {
          outline: { style: 'thin', color: { argb: COLORS.darkGray } }
        }
      };
    }
    
    // Destacar el total de registros
    const totalRegistrosRow = sheet.getRow(statesHeaderRow.number + 4);
    totalRegistrosRow.getCell(9).style = styles.summary;
    totalRegistrosRow.getCell(10).style = styles.summaryValue;
    
    // Añadir gráfico circular de estados (opcional)
    if (workbook.xlsx && workbook.xlsx.addChart) {
      try {
        const chart = workbook.addChart({
          type: 'pie',
          title: { 
            text: 'Distribución de Estados',
            font: { name: 'Calibri', size: 12, bold: true, color: { argb: COLORS.primary } }
          },
          legend: {
            position: 'right',
            font: { name: 'Calibri', size: 10 }
          },
          plotArea: {
            border: { color: { argb: COLORS.darkGray } }
          },
          dataLabels: {
            showValue: false,
            showPercent: true,
            showLegendKey: true
          }
        });
        
        chart.addSeries({
          name: 'Estados',
          data: [
            { name: 'Completados', value: countCompletado },
            { name: 'Fuera de tolerancia', value: countFueraTol },
            { name: 'Otros', value: countOtros }
          ],
          colors: [COLORS.success, COLORS.danger, COLORS.warning]
        });
        
        chart.setSize({
          width: 400,
          height: 300
        });
        
        sheet.addChart(chart, {
          tl: { col: 2, row: summaryStartRow },
          br: { col: 6, row: summaryStartRow + 15 }
        });
      } catch (error) {
        console.log("No se pudo crear el gráfico:", error.message);
      }
    }
    
    // Añadir pie de página
    sheet.addRow([]);
    sheet.addRow([]);
    
    const footerRow = sheet.rowCount + 1;
    sheet.mergeCells(`A${footerRow}:M${footerRow}`);
    const footerCell = sheet.getCell(`A${footerRow}`);
    footerCell.value = 'BAPROSA - Sistema de Gestión de Básculas © ' + new Date().getFullYear();
    Object.assign(footerCell.style, styles.footer);
    
    // Añadir información de fecha de generación
    sheet.mergeCells(`A${footerRow + 1}:M${footerRow + 1}`);
    const timestampCell = sheet.getCell(`A${footerRow + 1}`);
    timestampCell.value = `Informe generado: ${now.toLocaleDateString('es-ES')} a las ${now.toLocaleTimeString('es-ES')}`;
    timestampCell.style = {
      font: { name: 'Calibri', size: 8, color: { argb: COLORS.lightText } },
      alignment: { horizontal: 'center' }
    };

    // Proteger la hoja con contraseña (opcional)
    sheet.protect('baprosa', { formatCells: false, formatColumns: false });
    
    // No usamos AutoFilter para mantener el diseño limpio

    // Añadir un encabezado personalizado para la impresión
    sheet.headerFooter.oddHeader = '&L&B BAPROSA &C&"Calibri,Bold"REPORTE DE BOLETAS DE PESO&R&D';
    sheet.headerFooter.oddFooter = '&L&"Calibri,Regular"Usuario: Sistema&C&P de &N&R&"Calibri,Italic"BAPROSA';

    // Enviar Excel al cliente
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=reporte_boletas_${new Date().toISOString().split('T')[0]}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error generando el reporte Excel:", err);
    res.status(500).json({ error: "Error interno generando el reporte Excel" });
  }
};

module.exports = { exportToExcel };