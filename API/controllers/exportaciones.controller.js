const db = require("../lib/prisma");
const ExcelJS = require("exceljs");
const e = require("express");
const { setLogger } = require("../utils/logger");
const { CONFIGPAGE, styles, COLORS } = require("../lib/configExcel");

const exportToExcel = async (req, res) => {
  try {
    const { columnas } = req.body;
    console.log('Columnas recibidas:', columnas);
    
    // Validar que se recibieron columnas
    if (!columnas || !Array.isArray(columnas) || columnas.length === 0) {
      return res.status(400).json({ error: "No se especificaron columnas para exportar" });
    }
    
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

    // Crear objeto completo con todos los datos posibles
    const createFullDataObject = (el) => {
      const fechaInicio = el.fechaInicio ? new Date(el.fechaInicio) : null;
      const fechaFin = el.fechaFin ? new Date(el.fechaFin) : null;
      const diferenciaMs = fechaInicio && fechaFin ? fechaFin - fechaInicio : null;
      const isEspecialTraslado = el.proceso === 0 && (el.idMovimiento===10 || el.idMovimiento===11);

      let diferenciaTiempo = 'N/A';
      if (diferenciaMs !== null) {
        const minutos = Math.floor(diferenciaMs / 60000);
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        diferenciaTiempo = `${horas}h ${mins}m`;
      }

      // Crear la cadena de marchamos (todos los sellos concatenados)
      const sellos = [el.sello1, el.sello2, el.sello3, el.sello4, el.sello5, el.sello6]
        .filter(Boolean)
        .join(', ');
      
      const marchamos = sellos || '-';

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
        Factura: el.factura || '-', // Nueva propiedad para factura
        ManifiestoDeAgregados: el.manifiestoAgregados || '-', // Nueva propiedad
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
        Marchamos: marchamos, // Todos los sellos concatenados
        Sello1: el.sello1 || '-', 
        Sello2: el.sello2 || '-',
        Sello3: el.sello3 || '-',
        Sello4: el.sello4 || '-',
        Sello5: el.sello5 || '-',
        Sello6: el.sello6 || '-', 
      };
    };

    // Mapeo entre nombres del frontend y propiedades de datos
    const columnMapping = {
      'Boleta': 'Boleta',
      'Proceso': 'Proceso', 
      'Placa': 'Placa',
      'Cliente': 'Cliente',
      'Transporte': 'Transporte',
      'Motorista': 'Motorista',
      'Movimiento': 'Movimiento',
      'Producto': 'Producto',
      'Manifiesto': 'Manifiesto',
      'OrdenDeCompra': 'OrdenDeCompra',
      'OrdenDeTransferencia': 'OrdenDeTransferencia',
      'Origen': 'Origen',
      'Destino': 'Destino',
      'Tara': 'Tara',
      'PesoBruto': 'PesoBruto',
      'PesoNeto': 'PesoNeto',
      'PesoTeorico': 'PesoTeorico',
      'Desviación': 'Desviación',
      'Tolerancia': 'Tolerancia',
      'Estado': 'Estado',
      'FechaDeEntrada': 'FechaDeEntrada',
      'FechaFinalizacion': 'FechaFinalizacion',
      'TiempoTotal': 'TiempoTotal',
      'Sello1': 'Sello1',
      'Sello2': 'Sello2',
      'Sello3': 'Sello3',
      'Sello4': 'Sello4',
      'Sello5': 'Sello5',
      'Sello6': 'Sello6',
      // Mapeos para nombres del frontend que no coinciden exactamente
      'Desviacion': 'Desviación',
      'Fecha Final': 'FechaFinalizacion',
      'Fecha inicial': 'FechaDeEntrada',
      'Duración': 'TiempoTotal',
      'Factura': 'OrdenDeCompra', // Asumiendo que Factura se refiere a Orden de Compra
      'Manifiesto de agregados': 'OrdenDeTransferencia', // Asumiendo que se refiere a esto
      'Marchamos': 'Marchamos' // Asumiendo que Marchamos se refiere a los sellos, puedes cambiar a Sello2, etc.
    };

    // Generar datos completos para todas las boletas
    const boletasCompletas = datosReporte.map(createFullDataObject);

    // Filtrar solo las columnas solicitadas usando el mapeo
    const boletasFiltradas = boletasCompletas.map(boleta => {
      const boletaFiltrada = {};
      columnas.forEach(columnaFrontend => {
        const propiedadReal = columnMapping[columnaFrontend];
        if (propiedadReal && boleta.hasOwnProperty(propiedadReal)) {
          boletaFiltrada[columnaFrontend] = boleta[propiedadReal];
        } else {
          console.warn(`Columna '${columnaFrontend}' no mapeada o no encontrada. Propiedad real buscada: '${propiedadReal}'`);
          boletaFiltrada[columnaFrontend] = '-'; // Valor por defecto
        }
      });
      return boletaFiltrada;
    });

    // Definir anchos de columna por tipo de campo (actualizado con nombres del frontend)
    const getColumnWidth = (columnName) => {
      const widthMap = {
        'Boleta': 10,
        'Proceso': 12,
        'Placa': 15,
        'Cliente': 30,
        'Transporte': 30,
        'Motorista': 30,
        'Movimiento': 25,
        'Producto': 30,
        'Manifiesto': 20,
        'OrdenDeCompra': 20,
        'OrdenDeTransferencia': 25,
        'Origen': 20,
        'Destino': 20,
        'Tara': 15,
        'PesoBruto': 15,
        'PesoNeto': 12,
        'PesoTeorico': 14,
        'Desviación': 12,
        'Tolerancia': 14,
        'Estado': 30,
        'FechaDeEntrada': 20,
        'FechaFinalizacion': 20,
        'TiempoTotal': 15,
        'Sello1': 10,
        'Sello2': 10,
        'Sello3': 10,
        'Sello4': 10,
        'Sello5': 10,
        'Sello6': 10,
        // Anchos para nombres del frontend
        'Desviacion': 12,
        'Fecha Final': 20,
        'Fecha inicial': 20,
        'Duración': 15,
        'Factura': 20,
        'Manifiesto de agregados': 25,
        'Marchamos': 25
      };
      return widthMap[columnName] || 15; // Ancho por defecto
    };

    // Preparar datos para hoja de resumen (mantener lógica original)
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
    
    // HOJA 1: REPORTE PRINCIPAL DE BOLETAS
    const sheet = workbook.addWorksheet("Reporte de Boletas", CONFIGPAGE);

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
    const lastColumn = String.fromCharCode(64 + Math.min(columnas.length, 26)); // Convertir número a letra
    sheet.mergeCells(`C1:${lastColumn}1`);
    const titleCell = sheet.getCell("C1");
    titleCell.value = "BENEFICIO DE ARROZ PROGRESO S.A. DE C.V.";
    Object.assign(titleCell.style, styles.title);
    
    sheet.mergeCells(`C2:${lastColumn}2`);
    const subtitleCell = sheet.getCell("C2");
    subtitleCell.value = `REPORTE DE BOLETAS DE PESO`;
    Object.assign(subtitleCell.style, styles.subtitle);
    
    sheet.mergeCells(`C3:${lastColumn}3`);
    const dateCell = sheet.getCell("C3");
    const now = new Date();
    dateCell.value = `Generado el: ${now.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })} | Columnas: ${columnas.length}`;
    Object.assign(dateCell.style, styles.dateInfo);

    // Espacio antes de la tabla de datos
    sheet.addRow([]);
    
    // Encabezados de columnas (solo las seleccionadas)
    const headerRow = sheet.addRow(columnas);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      Object.assign(cell.style, styles.header);
    });
    
    // Configuración de anchos de columna
    columnas.forEach((columna, index) => {
      sheet.getColumn(index + 1).width = getColumnWidth(columna);
    });

    // Añadir datos de boletas
    boletasFiltradas.forEach((boleta, rowIndex) => {
      const dataRow = sheet.addRow(Object.values(boleta));
      dataRow.height = 22;
      
      // Aplicar estilo alternado a las filas
      if (rowIndex % 2 !== 0) {
        dataRow.eachCell((cell) => {
          cell.style = {...styles.data, ...styles.alternateRow};
        });
      } else {
        dataRow.eachCell((cell) => {
          Object.assign(cell.style, styles.data);
        });
      }
      
      // Aplicar formatos específicos según el tipo de columna
      columnas.forEach((columnaFrontend, colIndex) => {
        const cell = dataRow.getCell(colIndex + 1);
        const propiedadReal = columnMapping[columnaFrontend];
        const valor = boleta[columnaFrontend];
        
        // Determinar el tipo de columna basado en la propiedad real o el nombre del frontend
        const tipoColumna = propiedadReal || columnaFrontend;
        
        switch (tipoColumna) {
          case 'Proceso':
            if (cell.value === 'Entrada') {
              cell.font = { name: 'Calibri', size: 11, color: { argb: COLORS.white } };
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.secondary } };
            } else {
              cell.font = { name: 'Calibri', size: 11, color: { argb: COLORS.white } };
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.accent } };
            }
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            break;
            
          case 'Tara':
          case 'PesoBruto':
          case 'PesoNeto':
          case 'PesoTeorico':
          case 'Tolerancia':
            cell.numFmt = '#,##0.00 "lb"';
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
            break;
            
          case 'Desviación':
          case 'Desviacion':
            cell.numFmt = '#,##0.00 "lb"';
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
            const desviacionValue = parseFloat(valor) || 0;
            if (desviacionValue > -100 && desviacionValue < 100) {
              cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.success } };
            } else if (desviacionValue < -100 || desviacionValue > 100) {
              cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.danger } };
            }
            break;
            
          case 'Estado':
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            switch (cell.value) {
              case 'Completado':
                cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.white } };
                cell.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.success } };
                break;
              case 'Completo(Fuera de tolerancia)':
                cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.white } };
                cell.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.danger } };
                break;
              default:
                cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.white } };
                cell.fill = {type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.warning } };
            }
            break;
            
          case 'FechaDeEntrada':
          case 'FechaFinalizacion':
          case 'Fecha inicial':
          case 'Fecha Final':
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            break;
        }
      });
    });

    // Añadir pie de página
    sheet.addRow([]);
    sheet.addRow([]);
    
    const footerRow = sheet.rowCount + 1;
    sheet.mergeCells(`A${footerRow}:${lastColumn}${footerRow}`);
    const footerCell = sheet.getCell(`A${footerRow}`);
    footerCell.value = 'BAPROSA - Sistema de Gestión de Básculas © ' + new Date().getFullYear();
    Object.assign(footerCell.style, styles.footer);
    
    // HOJA 2: RESUMEN Y BOLETAS CANCELADAS (mantener lógica original)
    const resumenSheet = workbook.addWorksheet("Resumen", {
      properties: {
        tabColor: {argb: COLORS.warning}
      }
    });

    // [Aquí mantener toda la lógica de la hoja de resumen como estaba originalmente]
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
      resumenSheet.getColumn(1).width = 12;
      resumenSheet.getColumn(2).width = 12;
      resumenSheet.getColumn(3).width = 15;
      resumenSheet.getColumn(4).width = 30;
      resumenSheet.getColumn(5).width = 25;
      resumenSheet.getColumn(6).width = 30;
      resumenSheet.getColumn(7).width = 20;
      resumenSheet.getColumn(8).width = 40;
    } else {
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
    
    setLogger('REPORTES', `CREO REPORTE CON: ${columnas.filter(Boolean).join(', ')}`, req, null, 1, null);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error generando el reporte Excel:", err);
    setLogger('BOLETA', 'ERROR AL CREAR REPORTE PERSONALIZABLE', req, null, 3);
    res.status(500).json({ error: "Error interno generando el reporte Excel" });
  }
};

module.exports = { exportToExcel };