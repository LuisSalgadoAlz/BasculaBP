/* const db = require("../lib/prisma"); */
const ExcelJS = require("exceljs");
const { PrismaClient } = require('@prisma/client');
const e = require("express");
const { setLogger } = require("../utils/logger");
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

    // Obtener datos incluyendo canceladas para el resumen
    const data = await db.boleta.findMany({
      include: {
        tolva: {
          include:{
            principal:true,
            secundario: true,
            terciario: true, 
          }
        },
      },
      where: {
        fechaFin: { gte: startOfDay, lte: endOfDay },
        AND: [{estado: {not: "Pendiente"}}], // Solo excluir pendientes
        ...(movimiento ? { movimiento: movimiento } : {}),
        ...(producto ? { producto: producto } : {}),
        ...(socio ? {socio : socio} : {})
      },
      orderBy:{
        numBoleta: 'asc'
      }
    });

    // Verificación de datos
    if (!data || data.length === 0) 
      return res.status(404).json({ error: "No se encontraron registros para exportar" });

    // Separar datos para reporte principal (sin canceladas) y para resumen (todas)
    const datosCompletos = data;
    const datosReporte = data.filter(el => el.estado !== "Cancelada");

    /**
     * Aqui se ocupa cambiar cuando se implemente la ventana de JAVI
     */
    const boletas = datosReporte.map((el) => {
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
        Movimiento: el.movimiento, // Agregado como solicitaste
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

    // Preparar datos para hoja de resumen
    const boletasCanceladas = datosCompletos.filter(el => el.estado === "Cancelada").map(el => ({
      Boleta: el.numBoleta,
      Proceso: el.proceso == 0 ? 'Entrada' : 'Salida',
      Placa: el.placa,
      Cliente: el.socio,
      Movimiento: el.movimiento || '-',
      Producto: el.producto || '-',
      FechaCancelacion: el.fechaFin ? new Date(el.fechaFin).toLocaleString() : '-',
      Motivo: el.observaciones || 'Sin especificar'
    }));

    // Contadores para resumen
    let countCompletado = 0;
    let countFueraTol = 0;
    let countCanceladas = boletasCanceladas.length;
    let countOtros = 0;

    datosCompletos.forEach(boleta => {
      switch (boleta.estado) {
        case 'Completado':
          countCompletado++;
          break;
        case 'Completo(Fuera de tolerancia)':
          countFueraTol++;
          break;
        case 'Cancelada':
          // Ya contadas arriba
          break;
        default:
          countOtros++;
      }
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
    
    // HOJA 1: REPORTE PRINCIPAL DE BOLETAS
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
      }
    };

    // Logo para hoja principal
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
    titleCell.value = "BENEFICIO DE ARROZ PROGRESO S.A. DE C.V.";
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
    
    // Configuración de anchos de columna
    const columnWidths = [
      { header: 'Boleta', width: 10 },
      { header: 'Proceso', width: 12 },
      { header: 'Placa', width: 15 },
      { header: 'Cliente', width: 30 },
      { header: 'Transporte', width: 30 },
      { header: 'Motorista', width: 30 },
      { header: 'Movimiento', width: 25 }, // Agregado
      { header: 'Producto', width: 30 },
      { header: 'Manifiesto', width: 20 },
      { header: 'OrdenDeCompra', width: 20 },
      { header: 'OrdenDeTransferencia', width: 25 },
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
      { header: 'TiempoTotal', width: 20 },
      { header: 'Sello1', width: 10 },
      { header: 'Sello2', width: 10 },
      { header: 'Sello3', width: 10 },
      { header: 'Sello4', width: 10 },
      { header: 'Sello5', width: 10 },
      { header: 'Sello6', width: 10 }
    ];

    columnWidths.forEach((col, i) => {
      sheet.getColumn(i + 1).width = col.width;
    });

    // Añadir datos de boletas
    boletas.forEach((boleta, index) => {
      const dataRow = sheet.addRow(Object.values(boleta));
      dataRow.height = 22;
      
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
      
      // Formato especial para proceso
      const procesoCell = dataRow.getCell(2);
      if (procesoCell.value === 'Entrada') {
        procesoCell.font = { name: 'Calibri', size: 11, color: { argb: COLORS.white } };
        procesoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.secondary } };
      } else {
        procesoCell.font = { name: 'Calibri', size: 11, color: { argb: COLORS.white } };
        procesoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.accent } };
      }
      procesoCell.alignment = { horizontal: 'center', vertical: 'middle' };
      
      // Formato para valores numéricos (ajustadas las posiciones por el nuevo campo Movimiento)
      const pesoTaraCell = dataRow.getCell(14);
      pesoTaraCell.numFmt = '#,##0.00 "lb"';
      pesoTaraCell.alignment = { horizontal: 'right', vertical: 'middle' };

      const pesoBrutoCell = dataRow.getCell(15);
      pesoBrutoCell.numFmt = '#,##0.00 "lb"';
      pesoBrutoCell.alignment = { horizontal: 'right', vertical: 'middle' };

      const pesoNetoCell = dataRow.getCell(16);
      pesoNetoCell.numFmt = '#,##0.00 "lb"';
      pesoNetoCell.alignment = { horizontal: 'right', vertical: 'middle' };

      const pesoTeoricoCell = dataRow.getCell(17);
      pesoTeoricoCell.numFmt = '#,##0.00 "lb"';
      pesoTeoricoCell.alignment = { horizontal: 'right', vertical: 'middle' };

      const desviacionCell = dataRow.getCell(18);
      desviacionCell.numFmt = '#,##0.00 "lb"';
      desviacionCell.alignment = { horizontal: 'right', vertical: 'middle' };

      const toleranciaCell = dataRow.getCell(19);
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
      const estadoCell = dataRow.getCell(20);
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
      const fechaIncial = dataRow.getCell(21);
      fechaIncial.alignment = { horizontal: 'center', vertical: 'middle' };
      const fechaFinaCell = dataRow.getCell(22);
      fechaFinaCell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Añadir pie de página
    sheet.addRow([]);
    sheet.addRow([]);
    
    const footerRow = sheet.rowCount + 1;
    sheet.mergeCells(`A${footerRow}:M${footerRow}`);
    const footerCell = sheet.getCell(`A${footerRow}`);
    footerCell.value = 'BAPROSA - Sistema de Gestión de Básculas © ' + new Date().getFullYear();
    Object.assign(footerCell.style, styles.footer);
    
    // HOJA 2: RESUMEN Y BOLETAS CANCELADAS
    const resumenSheet = workbook.addWorksheet("Resumen", {
      properties: {
        tabColor: {argb: COLORS.warning}
      }
    });

    // Título de la hoja de resumen
    resumenSheet.mergeCells("A1:H1");
    const resumenTitleCell = resumenSheet.getCell("A1");
    resumenTitleCell.value = "RESUMEN DE ESTADOS DE BOLETAS";
    resumenTitleCell.style = {
      font: { name: 'Calibri', bold: true, size: 18, color: { argb: COLORS.primary } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: { bottom: { style: 'medium', color: { argb: COLORS.primary } } }
    };

    resumenSheet.mergeCells("A2:H2");
    const resumenSubtitleCell = resumenSheet.getCell("A2");
    resumenSubtitleCell.value = `Período: ${dateIn} - ${dateOut}`;
    resumenSubtitleCell.style = {
      font: { name: 'Calibri', bold: true, size: 12, color: { argb: COLORS.secondary } },
      alignment: { horizontal: 'center', vertical: 'middle' }
    };

    // Tabla de resumen
    resumenSheet.addRow([]);
    resumenSheet.addRow(['RESUMEN DE CANTIDADES', '', '', '']);
    const resumenHeaderRow = resumenSheet.lastRow;
    resumenHeaderRow.getCell(1).style = {
      font: { name: 'Calibri', bold: true, size: 14, color: { argb: COLORS.primary } },
      alignment: { horizontal: 'left', vertical: 'middle' }
    };

    // Datos del resumen
    const resumenData = [
      ['Estado', 'Cantidad', 'Porcentaje', ''],
      ['Completadas', countCompletado, `${((countCompletado / datosCompletos.length) * 100).toFixed(1)}%`, ''],
      ['Fuera de Tolerancia', countFueraTol, `${((countFueraTol / datosCompletos.length) * 100).toFixed(1)}%`, ''],
      ['Canceladas', countCanceladas, `${((countCanceladas / datosCompletos.length) * 100).toFixed(1)}%`, ''],
      ['Otros Estados', countOtros, `${((countOtros / datosCompletos.length) * 100).toFixed(1)}%`, ''],
      ['', '', '', ''],
      ['TOTAL', datosCompletos.length, '100%', '']
    ];

    resumenData.forEach((row, index) => {
      const dataRow = resumenSheet.addRow(row);
      
      if (index === 0) { // Header
        dataRow.eachCell((cell, colNumber) => {
          if (colNumber <= 3) {
            cell.style = {
              font: { name: 'Calibri', bold: true, size: 12, color: { argb: COLORS.white } },
              fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primary } },
              alignment: { horizontal: 'center', vertical: 'middle' },
              border: {
                top: { style: 'thin', color: { argb: COLORS.primary } },
                left: { style: 'thin', color: { argb: COLORS.primary } },
                bottom: { style: 'thin', color: { argb: COLORS.primary } },
                right: { style: 'thin', color: { argb: COLORS.primary } }
              }
            };
          }
        });
      } else if (index === resumenData.length - 1) { // Total row
        dataRow.eachCell((cell, colNumber) => {
          if (colNumber <= 3) {
            cell.style = {
              font: { name: 'Calibri', bold: true, size: 12, color: { argb: COLORS.primary } },
              fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.light } },
              alignment: { horizontal: 'center', vertical: 'middle' },
              border: {
                top: { style: 'medium', color: { argb: COLORS.primary } },
                left: { style: 'thin', color: { argb: COLORS.primary } },
                bottom: { style: 'thin', color: { argb: COLORS.primary } },
                right: { style: 'thin', color: { argb: COLORS.primary } }
              }
            };
          }
        });
      } else if (row[0] !== '') { // Data rows
        dataRow.eachCell((cell, colNumber) => {
          if (colNumber <= 3) {
            cell.style = {
              font: { name: 'Calibri', size: 11, color: { argb: COLORS.text } },
              alignment: { horizontal: 'center', vertical: 'middle' },
              border: {
                top: { style: 'thin', color: { argb: COLORS.darkGray } },
                left: { style: 'thin', color: { argb: COLORS.darkGray } },
                bottom: { style: 'thin', color: { argb: COLORS.darkGray } },
                right: { style: 'thin', color: { argb: COLORS.darkGray } }
              }
            };
          }
        });
      }
    });

    // Configurar anchos de columna para resumen
    resumenSheet.getColumn(1).width = 25;
    resumenSheet.getColumn(2).width = 15;
    resumenSheet.getColumn(3).width = 15;

    // Sección de boletas canceladas
    if (boletasCanceladas.length > 0) {
      resumenSheet.addRow([]);
      resumenSheet.addRow([]);
      resumenSheet.addRow(['DETALLE DE BOLETAS CANCELADAS', '', '', '', '', '', '', '']);
      const canceladasHeaderRow = resumenSheet.lastRow;
      canceladasHeaderRow.getCell(1).style = {
        font: { name: 'Calibri', bold: true, size: 14, color: { argb: COLORS.danger } },
        alignment: { horizontal: 'left', vertical: 'middle' }
      };

      // Headers para tabla de canceladas
      const canceladasHeaders = ['Boleta', 'Proceso', 'Placa', 'Cliente', 'Movimiento', 'Producto', 'Fecha Cancelación', 'Motivo'];
      const canceladasHeaderRow2 = resumenSheet.addRow(canceladasHeaders);
      canceladasHeaderRow2.eachCell((cell) => {
        cell.style = {
          font: { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.white } },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.danger } },
          alignment: { horizontal: 'center', vertical: 'middle' },
          border: {
            top: { style: 'thin', color: { argb: COLORS.danger } },
            left: { style: 'thin', color: { argb: COLORS.danger } },
            bottom: { style: 'thin', color: { argb: COLORS.danger } },
            right: { style: 'thin', color: { argb: COLORS.danger } }
          }
        };
      });

      // Datos de boletas canceladas
      boletasCanceladas.forEach((boleta, index) => {
        const dataRow = resumenSheet.addRow(Object.values(boleta));
        
        dataRow.eachCell((cell) => {
          cell.style = {
            font: { name: 'Calibri', size: 10, color: { argb: COLORS.text } },
            alignment: { vertical: 'middle' },
            border: {
              top: { style: 'thin', color: { argb: COLORS.darkGray } },
              left: { style: 'thin', color: { argb: COLORS.darkGray } },
              bottom: { style: 'thin', color: { argb: COLORS.darkGray } },
              right: { style: 'thin', color: { argb: COLORS.darkGray } }
            }
          };
        });

        if (index % 2 !== 0) {
          dataRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.gray } };
          });
        }
      });

      // Configurar anchos para tabla de canceladas
      resumenSheet.getColumn(1).width = 12; // Boleta
      resumenSheet.getColumn(2).width = 12; // Proceso
      resumenSheet.getColumn(3).width = 15; // Placa
      resumenSheet.getColumn(4).width = 30; // Cliente
      resumenSheet.getColumn(5).width = 25; // Movimiento
      resumenSheet.getColumn(6).width = 30; // Producto
      resumenSheet.getColumn(7).width = 20; // Fecha Cancelación
      resumenSheet.getColumn(8).width = 40; // Motivo
    } else {
      // Si no hay canceladas, mostrar mensaje
      resumenSheet.addRow([]);
      resumenSheet.addRow([]);
      resumenSheet.addRow(['BOLETAS CANCELADAS', '', '', '', '', '', '', '']);
      const noCanceladasRow = resumenSheet.addRow(['No se encontraron boletas canceladas en el período seleccionado', '', '', '', '', '', '', '']);
      noCanceladasRow.getCell(1).style = {
        font: { name: 'Calibri', italic: true, size: 11, color: { argb: COLORS.lightText } },
        alignment: { horizontal: 'center', vertical: 'middle' }
      };
    }

    // Proteger las hojas
    sheet.protect('baprosa', { formatCells: false, formatColumns: false });
    resumenSheet.protect('baprosa', { formatCells: false, formatColumns: false });

    // Añadir encabezados personalizados para impresión en ambas hojas
    sheet.headerFooter.oddHeader = '&L&B BAPROSA &C&"Calibri,Bold"REPORTE DE BOLETAS DE PESO&R&D';
    sheet.headerFooter.oddFooter = '&L&"Calibri,Regular"Usuario: Sistema&C&P de &N&R&"Calibri,Italic"BAPROSA';
    
    resumenSheet.headerFooter.oddHeader = '&L&B BAPROSA &C&"Calibri,Bold"RESUMEN DE ESTADOS&R&D';
    resumenSheet.headerFooter.oddFooter = '&L&"Calibri,Regular"Usuario: Sistema&C&P de &N&R&"Calibri,Italic"BAPROSA';

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
    /* setLogger('REPORTE', 'SE GENERO REPORTE DE EXCEL', req, null, 1, null) */  
    res.end();
  } catch (err) {
    console.error("Error generando el reporte Excel:", err);
    res.status(500).json({ error: "Error interno generando el reporte Excel" });
  }
};

module.exports = { exportToExcel };