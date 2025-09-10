const db = require('../lib/prisma')
const dotenv = require("dotenv");
const { setLogger } = require('../utils/logger');

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
                
                -- idMovimiento = 11 (manejo especial por proceso)
                SELECT 
                    b.id as id_boleta,
                    CASE 
                        WHEN pds.aplicaAlerta = 0 THEN
                            CASE 
                                WHEN b.proceso = 0 THEN 
                                    CASE 
                                        WHEN DATENAME(weekday, b.fechaInicio AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time') = 'Saturday' THEN
                                            CAST(DATEADD(day, 2, b.fechaInicio AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time') AS DATE)
                                        ELSE
                                            CAST(DATEADD(day, 1, b.fechaInicio AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time') AS DATE)
                                    END
                                WHEN b.proceso = 1 THEN 
                                    CASE 
                                        WHEN DATENAME(weekday, b.fechaFin AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time') = 'Saturday' THEN
                                            CAST(DATEADD(day, 2, b.fechaFin AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time') AS DATE)
                                        ELSE
                                            CAST(DATEADD(day, 1, b.fechaFin AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time') AS DATE)
                                    END
                                ELSE 
                                    CASE 
                                        WHEN DATENAME(weekday, b.fechaInicio AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time') = 'Saturday' THEN
                                            CAST(DATEADD(day, 2, b.fechaInicio AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time') AS DATE)
                                        ELSE
                                            CAST(DATEADD(day, 1, b.fechaInicio AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time') AS DATE)
                                    END
                            END
                        ELSE
                            CASE 
                                WHEN b.proceso = 0 THEN 
                                    CAST(b.fechaInicio AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time' AS DATE)
                                WHEN b.proceso = 1 THEN 
                                    CAST(b.fechaFin AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time' AS DATE)
                                ELSE 
                                    CAST(b.fechaInicio AT TIME ZONE 'UTC' AT TIME ZONE 'Central America Standard Time' AS DATE)
                            END
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
                'Inicio Báscula': boleta.fechaInicio ? new Date(boleta.fechaInicio).toLocaleString() : 'No Registrada',
                'Finalizo Báscula': boleta.fechaFin ? new Date(boleta.fechaFin).toLocaleString() : 'No Registrada',
            };

            return boleta.paseDeSalida.map(pase => ({
                Pase: pase.numPaseSalida,
                ...boletaBase,
                'Salio De Baprosa': pase.fechaSalida ? new Date(pase.fechaSalida).toLocaleString() : 'No Registrada',
                'Observación Guardia': pase.observaciones || 'N/A',
            }));
        });

        return res.status(200).send({ data: refactor });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ err: 'Error Interno del API' });
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
}