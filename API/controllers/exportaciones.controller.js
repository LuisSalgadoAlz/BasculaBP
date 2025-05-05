/* const db = require("../lib/prisma"); */
const ExcelJS = require("exceljs");
const { PrismaClient } = require('@prisma/client');
const e = require("express");
const db = new PrismaClient();

const exportToExcel = async (req, res) => {
  try {
    const data = await db.boleta.findMany({
      where: {
        AND: [{ estado: { not: 'Pendiente' } }, { estado: { not: 'Cancelada' } }]
      }
    });

    // Verificación de datos
    if (!data || data.length === 0) 
      return res.status(404).json({ error: "No se encontraron registros para exportar" });

    // Formateo de datos para el reporte
    const boletas = data.map((el) => ({
      Boleta: el.id,
      Proceso: el.proceso == 0 ? 'Entrada' : 'Salida',
      Placa: el.placa,
      Cliente: el.socio,
      Transporte: el.empresa,
      Producto: el.producto,
      Origen: (el.movimiento == 'Traslado Interno' || el.movimiento == 'Traslado Externo') ? el.trasladoOrigen : el.origen,
      Destino: (el.movimiento == 'Traslado Interno' || el.movimiento == 'Traslado Externo') ? el.trasladoDestino : el.destino,
      PesoNeto: el.pesoNeto,
      PesoTeorico: el.pesoTeorico, 
      Desviación: el.desviacion,
      Estado: el.estado,
      FechaFinalizacion: el.fechaFin ? el.fechaFin.toLocaleString() : 'N/A',
    }));

    // Creación del libro y hoja
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'BAPROSA';
    workbook.lastModifiedBy = 'Sistema de Básculas';
    workbook.created = new Date();
    workbook.modified = new Date();
    
    const sheet = workbook.addWorksheet("Reporte de Boletas", {
      pageSetup: {
        paperSize: 9, // A4
        orientation: 'landscape',
        fitToPage: true
      }
    });

    // Estilos generales
    const titleStyle = {
      font: { bold: true, size: 18, color: { argb: '002060' } },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };
    
    const subtitleStyle = {
      font: { bold: true, size: 14, color: { argb: '002060' } },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };
    
    const headerStyle = {
      font: { bold: true, size: 12, color: { argb: 'FFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '002060' } },
      alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };
    
    const dataStyle = {
      alignment: { vertical: 'middle' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };
    
    const alternateRowStyle = {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } }
    };

    // Logo (opcional)
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
    }

    // Encabezado del reporte
    sheet.mergeCells("C1:J1");
    const titleCell = sheet.getCell("C1");
    titleCell.value = "BÁSCULAS Y PROCESOS S.A.";
    Object.assign(titleCell.style, titleStyle);
    
    sheet.mergeCells("C2:J2");
    const subtitleCell = sheet.getCell("C2");
    subtitleCell.value = "REPORTE DE BOLETAS DE PESO";
    Object.assign(subtitleCell.style, subtitleStyle);
    
    sheet.mergeCells("C3:J3");
    const dateCell = sheet.getCell("C3");
    dateCell.value = `Generado el: ${new Date().toLocaleString()}`;
    dateCell.style.alignment = { horizontal: 'center' };

    // Espacio antes de la tabla de datos
    sheet.addRow([]);
    
    // Encabezados de columnas
    const headerRow = sheet.addRow(Object.keys(boletas[0]));
    headerRow.eachCell((cell) => {
      Object.assign(cell.style, headerStyle);
    });
    
    // Configuración de anchos de columna optimizados
    const columnWidths = [
      { header: 'Boleta', width: 10 },
      { header: 'Proceso', width: 12 },
      { header: 'Placa', width: 15 },
      { header: 'Cliente', width: 30 },
      { header: 'Transporte', width: 30 },
      { header: 'Producto', width: 30 },
      { header: 'Origen', width: 20 },
      { header: 'Destino', width: 20 },
      { header: 'PesoNeto', width: 12 },
      { header: 'PesoTeorico', width: 14 },
      { header: 'Desviación', width: 12 },
      { header: 'Estado', width: 15 },
      { header: 'FechaFinalizacion', width: 20 }
    ];
    
    columnWidths.forEach((col, i) => {
      sheet.getColumn(i + 1).width = col.width;
    });

    // Añadir datos
    boletas.forEach((boleta, index) => {
      const dataRow = sheet.addRow(Object.values(boleta));
      
      // Aplicar estilo alternado a las filas
      if (index % 2 !== 0) {
        dataRow.eachCell((cell) => {
          cell.style = {...dataStyle, ...alternateRowStyle};
        });
      } else {
        dataRow.eachCell((cell) => {
          Object.assign(cell.style, dataStyle);
        });
      }
      
      // Formato especial para ciertas columnas
      const pesoNetoCell = dataRow.getCell(8); 
      pesoNetoCell.numFmt = '#,##0.00 "lb"';

      const pesoTeoricoCell = dataRow.getCell(9); 
      pesoTeoricoCell.numFmt = '#,##0.00 "lb"';

      const desviacionCell = dataRow.getCell(10);
      desviacionCell.numFmt = '#,##0.00 "lb"';
      
      // Colorear estado según su valor
      const estadoCell = dataRow.getCell(11);
      switch (estadoCell.value) {
        case 'Completado':
          estadoCell.font = { color: { argb: 'eae5e4' } };
          estadoCell.fill = {type: 'pattern',pattern: 'solid',fgColor: { argb: '6ab91f' } };
          break;
        case 'Completo(Fuera de tolerancia)':
          estadoCell.font = { color: { argb: 'eae5e4' } };
          estadoCell.fill = {type: 'pattern',pattern: 'solid',fgColor: { argb: 'd53313' } };
          break;
        default:
          estadoCell.font = { color: { argb: '000000' } };
      }
    });

    // Añadir pie de página con información de totales
    sheet.addRow([]);
    const totalRow = sheet.addRow(['Total de Registros:', boletas.length, '', '', '', '', '', '', '', '', '']);
    totalRow.getCell(1).font = { bold: true };
    totalRow.getCell(2).font = { bold: true };
    
    // Añadir pie de página
    sheet.mergeCells(`A${sheet.rowCount + 2}:K${sheet.rowCount + 2}`);
    const footerCell = sheet.getCell(`A${sheet.rowCount + 2}`);
    footerCell.value = 'BAPROSA - Sistema de Gestión de Básculas';
    footerCell.style = { 
      font: { italic: true, color: { argb: '666666' } },
      alignment: { horizontal: 'center' } 
    };

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
