export const URLHOST = 'http://192.9.100.56:80/api/'
export const URLWEBSOCKET = 'ws://192.9.100.56:80'
export const VERSION = '1.0.9'

export const AUTH_CONFIG = {
  BASCULA: '/dashboard',
  ADMINISTRADOR: '/admin/dashboard',
  TOLVA: '/tolva/dashboard'
};

export const TOKEN_EXPIRY_MINUTES = 30;

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
        nombre : '🟢 Entrada de material'
    },
    {
        id : 1, 
        nombre : '🟡 Salida de material'
    },
]

export const propsMotionPadre = {
    initial : { scale: 1, opacity: 1, y: 0 },
    animate : { scale: 1, opacity: 1, y: 0 },
    exit : { scale: 1, opacity: 0, y: 0 },
    transition : { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
}

export const propsMotionHijo = {
    initial:{ scale: 0.1, opacity: 0, y: 50 },
    animate:{ scale: 1, opacity: 1, y: 0 },
    exit:{ scale: 0.1, opacity: 0, y: 50 },
    transition:{ duration: 0.7, ease: [0.22, 1, 0.36, 1] },
}

export const propsModalPrevisual = {
    initial:{ opacity: 0 },
    animate:{ opacity: 1 },
    exit:{ opacity: 0 },
    transition:{duration: 0.2 }
}

export const propsModalPrevisualHijo = {
    initial:{ scale: 1, y: 0 },
    animate:{ scale: 1, y: 0 },
    transition:{ type: "spring", damping: 15 },
}