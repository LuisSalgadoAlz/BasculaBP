const db = require('../lib/prisma')
const dotenv = require("dotenv");
const { setLogger } = require('../utils/logger');
const { CONFIGPAGE, styles, COLORS } = require('../lib/configExcel');
const ExcelJS = require('exceljs');

const getBuscarPlaca = async (req, res) => {
    try {
        const placa = (req.query.placa || '').trim().toUpperCase();
        
        if (!placa) {
            return res.send({ err: 'Ingresar una placa válida.' });
        }

        const boletas = await db.boleta.findMany({
            select: {
                id: true,
                numBoleta: true,
                proceso: true,
                placa: true,
                producto: true,
                origen: true,
                destino: true,
                furgon: true, 
                trasladoOrigen: true,
                trasladoDestino: true,
                movimiento: true,
                manifiesto: true,
                manifiestoDeAgregado: true,
                ordenDeCompra: true,
                ordenDeTransferencia: true,
                estado: true,
                fechaInicio: true,
                fechaFin: true,
                tolva: {
                    select: {
                        fechaEntrada: true,
                        fechaSalida: true,
                    }
                },
                paseDeSalida: {
                    select: {
                        id: true,
                        numPaseSalida: true,
                        estado: true,
                        fechaSalida: true,
                        aplicaAlerta: true,
                    }
                },
            },
            where: { placa },
            orderBy: { id: 'desc' },
            take: 2,
        });

        if (boletas.length === 0) {
            return res.send({ err: 'Actualmente no hay boletas activas vinculadas a esta placa.' });
        }

        // Normalizar paseDeSalida y encontrar el resultado óptimo
        const resultado = findOptimalBoleta(boletas);
        if(!resultado) return res.send({ err: 'Actualmente no hay boletas activas vinculadas a esta placa.' })
        
        return res.send({ data: resultado });

    } catch (err) {
        setLogger('GUARDIA', 'BUSCAR PLACA  - PASE DE SALIDA', req, null, 3)  
        console.error('Error en getBuscarPlaca:', err);
        return res.send({ err: 'Error interno del servidor' });
    }
};

const findOptimalBoleta = (boletas) => {
    // Normalizar los datos
    const boletasNormalizadas = boletas.map(boleta => ({
        ...boleta,
        paseDeSalida: Array.isArray(boleta.paseDeSalida)
            ? boleta.paseDeSalida.find(p => p.estado === false) || boleta.paseDeSalida[0]
            : boleta.paseDeSalida
    }));

    // Prioridad 1: Boletas con pase de salida pendiente (estado = false)
    const conPasePendiente = boletasNormalizadas.filter(
        boleta => boleta.paseDeSalida && boleta.paseDeSalida.estado === false
    );

    if (conPasePendiente.length > 0) {
        // Si hay múltiples, priorizar proceso = 1
        const conProceso1 = conPasePendiente.filter(boleta => boleta.proceso === 1);
        return conProceso1.length > 0 ? conProceso1[0] : conPasePendiente[0];
    }

    // Prioridad 2: Boletas sin pase de salida pero con estado pendiente
    const sinPasePendiente = boletasNormalizadas.filter(
        boleta => !boleta.paseDeSalida && boleta.estado === 'Pendiente'
    );

    if (sinPasePendiente.length > 0) {
        return sinPasePendiente[0];
    }

    // Prioridad 3: Cualquier boleta disponible
    return null;
};

const updatePaseDeSalida = async(req, res) => {
    try{
        const id = req.params.id || null;
        const {obs} = req.body;

        if (!id) return res.status(400).send({err: 'No se ingreso una ID'})
    
        const updatePaseSalida = await db.pasesDeSalida.update({
            data: {
                estado: true,
                fechaSalida: new Date(), 
                observaciones : obs,
            }, 
            where: {
                id: parseInt(id),
            }
        })
        
        setLogger('PASE DE SALIDA', 'EFECTUO EL PASE DE SALIDA', req, null, 1, updatePaseSalida.id)  

        return res.status(200).send({msg: 'Salida registrada, puede despachar el vehiculo.'})
    } catch(err){
        console.log(err)
        setLogger('GUARDIA', 'NO SE EFECTUO EL PASE DE SALIDA', req, null, 3)  
        return res.status(500).send({err: 'Error Interno del API'})
    }
}

const getStats = async(req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const todayFilter = {
            fechaSalida: {
                gte: startOfDay,
                lt: endOfDay      
            }
        };

        const [total, pendientes] = await Promise.all([
            db.pasesDeSalida.count({ where: {
                ...todayFilter, 
                estado: true
            } }),
            db.pasesDeSalida.count({
                where: {
                    estado : false
                }
            })
        ]);

        return res.status(200).json({ total, pendientes });
    } catch(err) {
        setLogger('GUARDIA', 'OBTENER ESTADISTICAS', req, null, 3)  
        console.log(err);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}

const getPorcentajeDeCumplimiento = async(req, res) => {
    try{
        const resultado = await db.$queryRaw`
            SELECT 
                fecha_local,
                SUM([No Realizo]) as [No Realizo],
                SUM([Efectuado]) as [Efectuado],
                SUM([Total Registros]) as [Total Registros],
                CASE 
                    WHEN SUM([Total Registros]) > 0 THEN 
                        CAST(SUM([Efectuado]) * 100.0 / SUM([Total Registros]) AS DECIMAL(5,2))
                    ELSE 0 
                END as [Porcentaje Cumplimiento]
            FROM (
                -- Procesos generales
                SELECT 
                    CAST(b.fechaFin AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time' AS DATE) as fecha_local,
                    CASE WHEN pds.estado = 0 THEN 1 ELSE 0 END as [No Realizo],
                    CASE WHEN pds.estado = 1 THEN 1 ELSE 0 END as [Efectuado],
                    1 as [Total Registros]
                FROM Boleta AS b
                INNER JOIN PasesDeSalida AS pds ON pds.idBoleta = b.id
                WHERE idMovimiento NOT IN (12, 11)
                    AND b.fechaFin IS NOT NULL
                
                UNION ALL
                
                -- Servicio de báscula
                SELECT 
                    CASE 
                        WHEN b.proceso = 0 THEN 
                            CAST(b.fechaInicio AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time' AS DATE)
                        WHEN b.proceso = 1 THEN 
                            CAST(b.fechaFin AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time' AS DATE)
                        ELSE 
                            CAST(b.fechaInicio AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time' AS DATE)
                    END AS fecha_local,
                    CASE WHEN pds.estado = 0 THEN 1 ELSE 0 END as [No Realizo],
                    CASE WHEN pds.estado = 1 THEN 1 ELSE 0 END as [Efectuado],
                    1 as [Total Registros]
                FROM Boleta AS b
                INNER JOIN PasesDeSalida AS pds ON pds.idBoleta = b.id
                WHERE idMovimiento = 11
                    AND (
                        (b.proceso = 0 AND b.fechaInicio IS NOT NULL) OR
                        (b.proceso = 1 AND b.fechaFin IS NOT NULL) OR
                        (b.proceso NOT IN (0,1) AND b.fechaInicio IS NOT NULL)
                    )
            ) AS DatosUnificados
            GROUP BY fecha_local
            ORDER BY fecha_local DESC;
        `;
        
        const refactorData = resultado.map((item) => ({
            fecha: item.fecha_local.toISOString().split('T')[0],
            'Registros': item["Total Registros"], 
            'Sin Registrar': item["No Realizo"],
            'Registrados': item["Efectuado"],
            'Porcentaje de cumplimiento': item["Porcentaje Cumplimiento"],
        }));

        return res.status(200).send(refactorData);
        
    } catch(err){
        console.log(err)
        return res.status(500).send({err: 'Error Interno del API'})
    }
}

const getBoletasPorFecha = async (req, res) => {
    try {
        const { fecha } = req.query; 

        if (!fecha || fecha=='undefined') {
            return res.status(400).send({ error: 'La fecha es requerida' });
        }

        const [year, month, day] = fecha.split("-").map(Number);
        fechaInicio = new Date(Date.UTC(year, month - 1, day, 6, 0, 0));
        fechaFin = new Date(Date.UTC(year, month - 1, day + 1, 5, 59, 59, 999));

        const boletas = await db.boleta.findMany({
            where: {
                OR: [
                    // Procesos general -  fechaFin
                    {
                        idMovimiento: { notIn: [11, 12] },
                        fechaFin: {
                            gte: fechaInicio,
                            lte: fechaFin
                        }
                    },
                    // Traslado proceso 0 - usar fechaInicio  
                    {
                        idMovimiento: 11,
                        proceso: 0,
                        fechaInicio: {
                            gte: fechaInicio,
                            lte: fechaFin
                        }
                    },
                    // Traslado proceso 1 - usar fechaFin
                    {
                        idMovimiento: 11,
                        proceso: 1,
                        fechaFin: {
                            gte: fechaInicio,
                            lte: fechaFin
                        }
                    },
                ]
            },
            include: {
                paseDeSalida: true
            },
            orderBy: {
                fechaFin: 'desc'
            }
        });

        // Crear array plano
        const resultado = boletas.flatMap(boleta => 
            boleta.paseDeSalida.map(pase => ({
                'Boleta': boleta.numBoleta,
                'Pase de Salida': pase.numPaseSalida,
                Placa: boleta.placa,
                Transporte: boleta.empresa,
                'Inicio Báscula': new Date(boleta.fechaInicio).toLocaleString(),
                'Finalizo Báscula': boleta.fechaFin ? new Date(boleta.fechaFin).toLocaleString() : 'No Registrada',
                proceso: boleta.proceso == 0 ? 'Entrada' : 'Salida',
                movimiento: boleta.movimiento,
                Producto: boleta.producto, 
                'Salio De Baprosa': pase.fechaSalida ? new Date(pase.fechaSalida).toLocaleString() : 'No Registrada',
                Comentarios: pase.observaciones || 'N/A', 
                Guardia: pase.estado == true ? 'Registrado' : 'Sin Registrar'
            }))
        );

        return res.status(200).send({
            fecha,
            total: resultado.length,
            boletas: resultado
        });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ error: 'Error Interno del API' });
    }
};

const getPorcentajeMes = async(req, res) => {
    try{
        const start = req.query.start || "";
        const end = req.query.end || "";
        
        const resultado = await db.$queryRaw`
            SELECT 
                fecha_local,
                SUM([No Realizo]) as [No Realizo],
                SUM([Efectuado]) as [Efectuado],
                SUM([Total Registros]) as [Total Registros],
                CASE 
                    WHEN SUM([Total Registros]) > 0 THEN 
                        CAST(SUM([Efectuado]) * 100.0 / SUM([Total Registros]) AS DECIMAL(5,2))
                    ELSE 0 
                END as [Porcentaje Cumplimiento],
                STRING_AGG(CAST(id_boleta AS VARCHAR), ', ') as [IDs_Boletas]
            FROM (
                -- Procesos generales (excluyendo idMovimiento 12 y 11)
                SELECT 
                    b.id as id_boleta,
                    CASE 
                        WHEN pds.aplicaAlerta = 0 THEN 
                            CASE 
                                WHEN DATENAME(weekday, b.fechaFin AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time') = 'Saturday' THEN
                                    CAST(DATEADD(day, 2, b.fechaFin AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time') AS DATE)
                                ELSE
                                    CAST(DATEADD(day, 1, b.fechaFin AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time') AS DATE)
                            END
                        ELSE 
                            CAST(b.fechaFin AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time' AS DATE)
                    END as fecha_local,
                    CASE WHEN pds.estado = 0 THEN 1 ELSE 0 END as [No Realizo],
                    CASE WHEN pds.estado = 1 THEN 1 ELSE 0 END as [Efectuado],
                    1 as [Total Registros]
                FROM Boleta AS b
                INNER JOIN PasesDeSalida AS pds ON pds.idBoleta = b.id
                WHERE idMovimiento NOT IN (12, 11)
                    AND b.fechaFin IS NOT NULL
                    AND b.fechaFin >= ${start} AND b.fechaFin <= ${end}
                
                UNION ALL
                
                -- idMovimiento = 11 (NO aplica regla de aplicaAlerta - siempre usa la fecha exacta)
                SELECT 
                    b.id as id_boleta,
                    CASE 
                        WHEN b.proceso = 0 THEN 
                            CAST(b.fechaInicio AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time' AS DATE)
                        WHEN b.proceso = 1 THEN 
                            CAST(b.fechaFin AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time' AS DATE)
                        ELSE 
                            CAST(b.fechaInicio AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time' AS DATE)
                    END AS fecha_local,
                    CASE WHEN pds.estado = 0 THEN 1 ELSE 0 END as [No Realizo],
                    CASE WHEN pds.estado = 1 THEN 1 ELSE 0 END as [Efectuado],
                    1 as [Total Registros]
                FROM Boleta AS b
                INNER JOIN PasesDeSalida AS pds ON pds.idBoleta = b.id
                WHERE idMovimiento = 11
                    AND (
                        (b.proceso = 0 AND b.fechaInicio IS NOT NULL) OR
                        (b.proceso = 1 AND b.fechaFin IS NOT NULL) OR
                        (b.proceso NOT IN (0,1) AND b.fechaInicio IS NOT NULL)
                    )
                    AND (
                        (b.proceso = 0 AND b.fechaInicio >= ${start} AND b.fechaInicio <= ${end}) OR
                        (b.proceso = 1 AND b.fechaFin >= ${start} AND b.fechaFin <= ${end}) OR
                        (b.proceso NOT IN (0,1) AND b.fechaInicio >= ${start} AND b.fechaInicio <= ${end})
                    )

                UNION ALL
                
                -- idMovimiento = 12 (manejo especial - puede tener doble pase de salida cuando proceso = 0)
                SELECT 
                    b.id as id_boleta,
                    CASE 
                        WHEN pds.aplicaAlerta = 0 THEN
                            CASE 
                                WHEN b.proceso = 1 THEN 
                                    -- Para proceso = 1, usar fechaFin
                                    CASE 
                                        WHEN DATENAME(weekday, b.fechaFin AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time') = 'Saturday' THEN
                                            CAST(DATEADD(day, 2, b.fechaFin AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time') AS DATE)
                                        ELSE
                                            CAST(DATEADD(day, 1, b.fechaFin AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time') AS DATE)
                                    END
                                ELSE 
                                    -- Para proceso = 0, determinar si usar fechaInicio o fechaFin
                                    CASE 
                                        WHEN b.fechaFin IS NOT NULL THEN
                                            -- Si tiene fechaFin, usar fechaFin (pase de cierre)
                                            CASE 
                                                WHEN DATENAME(weekday, b.fechaFin AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time') = 'Saturday' THEN
                                                    CAST(DATEADD(day, 2, b.fechaFin AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time') AS DATE)
                                                ELSE
                                                    CAST(DATEADD(day, 1, b.fechaFin AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time') AS DATE)
                                            END
                                        ELSE
                                            -- Si no tiene fechaFin, usar fechaInicio (pase de creación)
                                            CASE 
                                                WHEN DATENAME(weekday, b.fechaInicio AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time') = 'Saturday' THEN
                                                    CAST(DATEADD(day, 2, b.fechaInicio AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time') AS DATE)
                                                ELSE
                                                    CAST(DATEADD(day, 1, b.fechaInicio AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time') AS DATE)
                                            END
                                    END
                            END
                        ELSE
                            CASE 
                                WHEN b.proceso = 1 THEN 
                                    -- Para proceso = 1, usar fechaFin
                                    CAST(b.fechaFin AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time' AS DATE)
                                ELSE 
                                    -- Para proceso = 0, determinar si usar fechaInicio o fechaFin
                                    CASE 
                                        WHEN b.fechaFin IS NOT NULL THEN
                                            -- Si tiene fechaFin, usar fechaFin (pase de cierre)
                                            CAST(b.fechaFin AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time' AS DATE)
                                        ELSE
                                            -- Si no tiene fechaFin, usar fechaInicio (pase de creación)
                                            CAST(b.fechaInicio AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time' AS DATE)
                                    END
                            END
                    END AS fecha_local,
                    CASE WHEN pds.estado = 0 THEN 1 ELSE 0 END as [No Realizo],
                    CASE WHEN pds.estado = 1 THEN 1 ELSE 0 END as [Efectuado],
                    1 as [Total Registros]
                FROM Boleta AS b
                INNER JOIN PasesDeSalida AS pds ON pds.idBoleta = b.id
                WHERE idMovimiento = 12
                    AND (
                        (b.proceso = 1 AND b.fechaFin IS NOT NULL) OR
                        (b.proceso = 0 AND b.fechaInicio IS NOT NULL) OR
                        (b.proceso NOT IN (0,1) AND b.fechaInicio IS NOT NULL)
                    )
                    AND (
                        (b.proceso = 1 AND b.fechaFin >= ${start} AND b.fechaFin <= ${end}) OR
                        (b.proceso = 0 AND b.fechaFin IS NOT NULL AND b.fechaFin >= ${start} AND b.fechaFin <= ${end}) OR
                        (b.proceso = 0 AND b.fechaFin IS NULL AND b.fechaInicio >= ${start} AND b.fechaInicio <= ${end}) OR
                        (b.proceso NOT IN (0,1) AND b.fechaInicio >= ${start} AND b.fechaInicio <= ${end})
                    )

            ) AS DatosUnificados
            GROUP BY fecha_local
            ORDER BY fecha_local DESC;
        `;
        
        const refactorData = resultado.map((item) => ({
            fecha: item.fecha_local.toISOString().split('T')[0],
            'Registros': item["Total Registros"], 
            'Sin Registrar': item["No Realizo"],
            'Registrados': item["Efectuado"],
            'Porcentaje de cumplimiento': item["Porcentaje Cumplimiento"],
            boletas: item["IDs_Boletas"].split(', ').map(id => parseInt(id))
        }));

        const makeCalendar = refactorData.map((item, index) => ({
            title: `Pases: ${item['Registrados']}/${item['Registros']}`,
            start: item.fecha,
            allDay: true,
            display: "auto",
            textColor: "black",
            backgroundColor: "transparent",
            borderColor: "transparent", // Cambiado a transparente
            boletas: item.boletas,
            onlyColor: item['Porcentaje de cumplimiento'],
        }));

        return res.status(200).send(makeCalendar);
    } catch(err){
        console.log(err)
        return res.status(500).send({err: 'Error Interno del API'})
    }
}

const getBoletasPorFechaCalendario = async (req, res) => {
    try {
        const { boleta } = req.body;

        const boletasDetails = await db.boleta.findMany({
            select: {
                numBoleta: true,
                proceso: true,
                placa: true,
                motorista: true, 
                producto: true,
                empresa: true,
                origen: true,
                destino: true, 
                furgon: true,
                fechaInicio: true,
                movimiento: true, 
                fechaFin: true,
                paseDeSalida: {
                    select: { // aquí hay que usar select, no solo propiedades
                        numPaseSalida: true,
                        fechaSalida: true,
                        observaciones: true,
                        estado: true,
                    }
                },
                observaciones: true,
            },
            where: {
                id: {
                    in: boleta
                }
            }
        });

        const refactor = boletasDetails.flatMap(boleta => {
            const boletaBase = {
                'Boleta': boleta.numBoleta || 'N/A',
                'Placa': boleta.placa,
                'Furgón': boleta.furgon || 'N/A',
                'Motorista': boleta.motorista,
                'Transporte': boleta.empresa,
                'Movimiento': boleta.movimiento, 
                'Origen': boleta.origen,
                'Destino': boleta.destino,
                'Observación Báscula': boleta.observaciones || 'N/A',
                'Inicio Báscula': boleta.fechaInicio ? new Date(boleta.fechaInicio).toLocaleString() : false,
                'Finalizo Báscula': boleta.fechaFin ? new Date(boleta.fechaFin).toLocaleString() : false,
            };

            return boleta.paseDeSalida.map(pase => ({
                Pase: pase.numPaseSalida,
                ...boletaBase,
                'Salio De Baprosa': pase.fechaSalida ? new Date(pase.fechaSalida).toLocaleString() : false,
                'Observación Guardia': pase.observaciones || 'N/A',
            }));
        });

        return res.status(200).send({ data: refactor });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err: 'Error Interno del API' });
    }
};

const getServicioDeBasculaStats = async (req, res) => {
  try {
    const dateIn = req.query.dateIn || null;
    const dateOut = req.query.dateOut || null;

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

    const totalServicioBascula = await db.boleta.count({
      where: {
        idMovimiento: 12, 
        idProducto: { in: [24, 25] }, // Solo contar productos 24 y 25
        ...(fechasValidas ? { fechaFin: { gte: startOfDay, lte: endOfDay } } : {}),
      }
    });

    const serviciosPorProducto = await db.boleta.groupBy({
      by: ['idProducto'],
      where: {
        idMovimiento: 12, 
        idProducto: { in: [24, 25] }, // Solo agrupar productos 24 y 25
        ...(fechasValidas ? { fechaFin: { gte: startOfDay, lte: endOfDay } } : {}),
      },
      _count: {
        _all: true
      }
    });

    // Crear un objeto para mapear los resultados
    const resultadosPorProducto = {
      24: { cantidad: 0, valorPorUnidad: 400 },
      25: { cantidad: 0, valorPorUnidad: 300 }
    };

    // Llenar con los datos obtenidos
    serviciosPorProducto.forEach(item => {
      if (resultadosPorProducto[item.idProducto]) {
        resultadosPorProducto[item.idProducto].cantidad = item._count._all;
      }
    });

    // Construir el array de productos siempre con 24 y 25
    const valoresPorProducto = [
      {
        producto: 24,
        cantidad: resultadosPorProducto[24].cantidad,
        totalLempiras: resultadosPorProducto[24].cantidad * resultadosPorProducto[24].valorPorUnidad
      },
      {
        producto: 25,
        cantidad: resultadosPorProducto[25].cantidad,
        totalLempiras: resultadosPorProducto[25].cantidad * resultadosPorProducto[25].valorPorUnidad
      }
    ];

    const totalGeneral = valoresPorProducto.reduce((total, item) => {
      return total + item.totalLempiras;
    }, 0);

    const response = {
      success: true,
      data: {
        totalServicios: totalServicioBascula,
        productoDetalle: valoresPorProducto,
        totalGeneralLempiras: totalGeneral
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error al obtener estadísticas de báscula:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

const getServicioDeBascula = async(req, res) => {
    try {
        const dateIn = req.query.dateIn || null;
        const dateOut = req.query.dateOut || null;
        
        // Parámetros de paginación
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

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

        // Condiciones de búsqueda
        const whereConditions = {
            idMovimiento: 12,
            ...(fechasValidas ? { fechaFin: { gte: startOfDay, lte: endOfDay } } : {}),
        };

        // Obtener el total de registros para calcular la paginación
        const totalRecords = await db.boleta.count({
            where: whereConditions
        });

        // Obtener los registros paginados
        const boletas = await db.boleta.findMany({
            where: whereConditions,
            include: {
                paseDeSalida: {
                    orderBy: {
                        id: 'desc'  // Ordenar por ID descendente para obtener el más alto primero
                    }
                }
            },
            orderBy: {
                fechaFin: 'desc'
            },
            skip: skip,
            take: limit
        });

        const refactor = boletas.map((item) => {
            // Obtener el pase de salida con el ID más alto
            const paseConIdMasAlto = item.paseDeSalida[0]; // Ya viene ordenado por ID desc
            
            return {
                'Boleta': item.numBoleta || 'En proceso...',
                'Placa': item.placa,
                'Motorista': item.motorista,
                'Transporte': item.empresa,
                'Tipo': item.producto,
                'Pase': paseConIdMasAlto?.numPaseSalida || 'Sin pase',
                'Inicio Báscula': new Date(item.fechaInicio).toLocaleString(),
                'Finalizo Báscula': item.fechaFin ? new Date(item.fechaFin).toLocaleString() : 'No Registrada',
                'Salio BAPROSA': paseConIdMasAlto?.fechaSalida ? new Date(paseConIdMasAlto.fechaSalida).toLocaleString() : item.estado==='Cancelada' ? 'CANCELADA' : 'N/A',
                'Origen': item.origen ? item.origen : item.estado==='Cancelada' ? 'CANCELADA' : 'N/A',
                'Destino': item.destino ? item.destino : item.estado==='Cancelada' ? 'CANCELADA' : 'N/A',
            }
        });

        // Calcular información de paginación
        const totalPages = Math.ceil(totalRecords / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        return res.status(200).send({
            data: refactor,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalRecords: totalRecords,
                recordsPerPage: limit,
                hasNextPage: hasNextPage,
                hasPreviousPage: hasPreviousPage,
                recordsOnCurrentPage: refactor.length
            }
        });
    } catch(err) {
        console.log(err);
        return res.status(500).send({err: 'Error Interno del API'});
    }
}

const exportServicioBasculaToExcel = async (req, res) => {
    try {
        const dateIn = req.query.dateIn || null;
        const dateOut = req.query.dateOut || null;
        
        const fechasValidas = dateIn && dateOut && 
                            dateIn !== "undefined" && dateOut !== "undefined" && 
                            dateIn !== "null" && dateOut !== "null" && 
                            dateIn.trim() !== "" && dateOut.trim() !== "";
                            
        let startOfDay, endOfDay;
        if (fechasValidas) {
            const [y1, m1, d1] = dateIn.split("-").map(Number);
            startOfDay = new Date(Date.UTC(y1, m1 - 1, d1, 6, 0, 0));
            const [y2, m2, d2] = dateOut.split("-").map(Number);
            endOfDay = new Date(Date.UTC(y2, m2 - 1, d2 + 1, 6, 0, 0));
        }

        // Condiciones de búsqueda (sin paginación para exportar todo)
        const whereConditions = {
            idMovimiento: 12,
            ...(fechasValidas ? { fechaFin: { gte: startOfDay, lte: endOfDay } } : {}),
        };

        // Obtener TODOS los registros (sin paginación para export)
        const boletas = await db.boleta.findMany({
            where: whereConditions,
            include: {
                paseDeSalida: {
                    orderBy: {
                        id: 'desc'
                    }
                }
            },
            orderBy: {
                fechaFin: 'desc'
            }
        });

        // Transformar los datos
        const dataForExcel = boletas.map((item) => {
            const paseConIdMasAlto = item.paseDeSalida[0];
            
            return {
                Boleta: item.numBoleta || 'En proceso...',
                Placa: item.placa,
                Motorista: item.motorista,
                Transporte: item.empresa,
                Tipo: item.producto,
                Pase: paseConIdMasAlto?.numPaseSalida || 'Sin pase',
                InicioBascula: new Date(item.fechaInicio).toLocaleString(),
                FinalizoBascula: item.fechaFin ? new Date(item.fechaFin).toLocaleString() : 'No Registrada',
                SalioBAPROSA: paseConIdMasAlto?.fechaSalida ? new Date(paseConIdMasAlto.fechaSalida).toLocaleString() : item.estado==='Cancelada' ? 'CANCELADA' : 'N/A',
                Origen: item.origen ? item.origen : item.estado==='Cancelada' ? 'CANCELADA' : 'N/A',
                Destino: item.destino ? item.destino : item.estado==='Cancelada' ? 'CANCELADA' : 'N/A',
            };
        });

        // Crear el libro de trabajo Excel
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'BAPROSA';
        workbook.lastModifiedBy = 'Sistema de Básculas';
        workbook.created = new Date();
        workbook.modified = new Date();

        // ===== HOJA PRINCIPAL: SERVICIO DE BÁSCULA =====
        const sheet = workbook.addWorksheet("Servicio de Báscula", CONFIGPAGE);

        // Logo o placeholder
        try {
            const logoId = workbook.addImage({
                filename: "logo.png",
                extension: "png",
            });
            sheet.addImage(logoId, {
                tl: { col: 8, row: 1 },
                br: { col: 11, row: 5 },
                editAs: 'oneCell'
            });
        } catch (error) {
            sheet.mergeCells("A1:A3");
            const placeholderCell = sheet.getCell("A1");
            placeholderCell.value = "BAPROSA";
            placeholderCell.style = {
                font: { name: 'Arial', bold: true, size: 18, color: { argb: COLORS.primary } },
                alignment: { horizontal: 'center', vertical: 'middle' },
                border: { outline: { style: 'medium', color: { argb: COLORS.primary } } }
            };
        }

        // Encabezado del reporte
        sheet.mergeCells("A1:K1");
        const titleCell = sheet.getCell("A1");
        titleCell.value = "BENEFICIO DE ARROZ PROGRESO, S.A. DE C.V.";
        Object.assign(titleCell.style, styles.title);
        
        sheet.mergeCells("A2:K2");
        const subtitleCell = sheet.getCell("A2");
        subtitleCell.value = `REPORTE DE SERVICIO DE BÁSCULA`;
        Object.assign(subtitleCell.style, styles.subtitle);

        // Información del período
        if (fechasValidas) {
            sheet.mergeCells("A3:K3");
            const periodCell = sheet.getCell("A3");
            periodCell.value = `Período: ${new Date(startOfDay).toLocaleDateString()} - ${new Date(endOfDay).toLocaleDateString()}`;
            Object.assign(periodCell.style, styles.dateInfo);
        }
        
        const now = new Date();
        sheet.mergeCells("A4:K4");
        const dateCell = sheet.getCell("A4");
        dateCell.value = `Generado el: ${now.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}`;
        Object.assign(dateCell.style, styles.dateInfo);

        sheet.mergeCells("A5:K5");
        const totalCell = sheet.getCell("A5");
        totalCell.value = `Total de registros: ${dataForExcel.length}`;
        Object.assign(totalCell.style, styles.dateInfo);

        sheet.addRow([]);

        // ===== DETALLE DE REGISTROS =====
        const detalleRow = sheet.addRow([]);
        sheet.mergeCells(`A${sheet.rowCount}:K${sheet.rowCount}`);
        const detalleTitle = sheet.getCell(`A${sheet.rowCount}`);
        detalleTitle.value = "DETALLE DE REGISTROS";
        Object.assign(detalleTitle.style, styles.sectionTitle);
        
        sheet.addRow([]);

        // Encabezados principales
        const mainHeaders = [
            'Boleta', 'Placa', 'Motorista', 'Transporte', 'Tipo', 
            'Pase', 'Inicio Báscula', 'Finalizó Báscula', 'Salió BAPROSA', 
            'Origen', 'Destino'
        ];

        const headerRow = sheet.addRow(mainHeaders);
        headerRow.height = 25;
        
        mainHeaders.forEach((header, index) => {
            const cell = sheet.getCell(sheet.rowCount, index + 1);
            Object.assign(cell.style, styles.header);
        });

        // Datos
        dataForExcel.forEach((registro, i) => {
            const dataRow = sheet.addRow([
                registro.Boleta,
                registro.Placa,
                registro.Motorista,
                registro.Transporte,
                registro.Tipo,
                registro.Pase,
                registro.InicioBascula,
                registro.FinalizoBascula,
                registro.SalioBAPROSA,
                registro.Origen,
                registro.Destino
            ]);
            dataRow.height = 20;
            
            // Aplicar estilos alternados
            dataRow.eachCell((cell, colIndex) => {
                if (i % 2 !== 0) {
                    cell.style = {...styles.data, ...styles.alternateRow};
                } else {
                    Object.assign(cell.style, styles.data);
                }
                
                // Centrar fechas y horas
                if (colIndex >= 7 && colIndex <= 9) { // Columnas de fecha/hora
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }
            });
        });

        // Configurar anchos de columna
        const columnWidths = [15, 12, 25, 20, 15, 15, 20, 20, 20, 15, 15];
        columnWidths.forEach((width, i) => {
            sheet.getColumn(i + 1).width = width;
        });

        // Pie de página
        sheet.addRow([]);
        sheet.addRow([]);
        const footerRowNum = sheet.rowCount + 1;
        sheet.mergeCells(`A${footerRowNum}:K${footerRowNum}`);
        const footerCell = sheet.getCell(`A${footerRowNum}`);
        footerCell.value = 'BENEFICIO DE ARROZ PROGRESO, S.A. DE C.V. © ' + new Date().getFullYear();
        Object.assign(footerCell.style, styles.footer);

        /* Proteger Hoja */
        sheet.protect('baprosa', { formatCells: false, formatColumns: false });

        // Configurar la respuesta para descargar el archivo Excel
        const fechaActual = new Date().toISOString().split('T')[0];
        const filename = `servicio_bascula_${fechaActual}.xlsx`;
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        // Log si tienes la función setLogger disponible
        // setLogger('REPORTES', `CREO REPORTE DE SERVICIO DE BÁSCULA`, req, null, 1, null);

        // Escribir el archivo Excel a la respuesta
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error en exportServicioBasculaToExcel:', error);
        // setLogger('REPORTES', 'ERROR EN GENERAR REPORTE DE SERVICIO DE BÁSCULA', req, null, 3);

        return res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getBuscarPlaca, 
    updatePaseDeSalida, 
    getStats,
    getPorcentajeDeCumplimiento,
    getBoletasPorFecha,
    getPorcentajeMes,
    getBoletasPorFechaCalendario,
    getServicioDeBasculaStats,
    getServicioDeBascula,
    exportServicioBasculaToExcel 
}