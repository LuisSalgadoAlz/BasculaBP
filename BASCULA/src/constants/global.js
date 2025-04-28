export const URLHOST = 'http://192.9.100.56:3000/api/'
export const URLWEBSOCKET = 'ws://192.9.100.56:3000'
export const ESTADOS_BOLETAS = [
    {
        id : 0, 
        nombre : '🟢 Boleta Normal'
    },
    {
        id : 1, 
        nombre : '🔵 Boleta Casulla'
    }, 
    {
        id : 2, 
        nombre : '🟣 Boleta Vehiculo Particular'
    }, 
]

export const ESTADOS_BOLETAS_TERMINADA = [
    {
        id : 0, 
        nombre : '🟢 Completo e Impreso'
    },
    {
        id : 1, 
        nombre : '🔴 Completo (pero peso fuera de tolerancia)'
    },
    {
        id : 2, 
        nombre : '❌ Cancelada'
    },
]

export const Proceso = [
    {
        id : 0, 
        nombre : 'Entrada de material'
    },
    {
        id : 1, 
        nombre : 'Salida de material'
    },
]