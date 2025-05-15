const db = require('../lib/prisma')
const dotenv = require('dotenv')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const typesOfUsers = ['VACIO','ADMINISTRADOR', 'BASCULA', 'TOLVA', 'CONTABILIDAD']
const typesOfState = ['VACIO', true, false]

/* Listar usuarios */
const getUsuarios = async (req, res) => {   
    try{
        const search = req.query.search || '';
        const tipo = req.query.tipo || '';
        const estado = req.query.estado || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;

        const where = {
            ...(search ? {name: {contains: search}}: {}), 
            ...(tipo ? {tipo:typesOfUsers[tipo]} : {}), 
            ...(estado ? {estado : typesOfState[estado]} : {})
        }
        
        const data = await db.usuarios.findMany({
            where, 
            skip,
            take: limit,
        })

        const totalData = await db.usuarios.count({ where })

        const refactorData = data.map((item)=>({
            ...item, estado: item.estado ? 'Activo' : 'Inactivo'
        }))
        res.json({
            data: refactorData,
            pagination: {
                totalData,
                totalPages: Math.ceil(totalData / limit),
                currentPage: page,
                limit,
            },
        })
    } catch(err) {
        console.log(err)
    }
}
 
// Para verificar si el usuario ya existe metodo post y put
const bucarUsuario = async (nameUser) => { 
    const data = await db.usuarios.findUnique({
        where: {
            usuarios: nameUser
        }
    })
    return data ? true : false
}

/* Crear usuarios */
const postUsuarios = async (req, res) => {
    try {
        const { name, email, tipo, contrasena, usuarios } = req.body;

        // Verifica si el usuario ya existe
        const usuarioExistente = await bucarUsuario(usuarios);
        if (usuarioExistente) {
            return res.status(201).json({ msgErr: 'El usuario ya existe' });
        }

        // Hashea la contra
        const hashedPassword = await bcrypt.hash(contrasena, 10);

        // Crear el nuevo usuario
        const nuevoUsuario = await db.usuarios.create({
            data: {
                name,
                usuarios,
                email,
                tipo,
                contrasena: hashedPassword, 
                estado: true, 
            }
        });

        // Responder con el usuario creado
        res.status(201).json({ msg: 'Usuario creado exitosamente'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ msgErr: `Error al crear usuario: ${error.message}` });
    }
};

/* Modificar usuarios */
const updateUsuarios = async (req, res) => {
    try {
        const {name, email, tipo, contrasena, usuarios, estado} = req.body
    
        // Verifica si el usuario que quiere modicar ya exista
        const usuarioExistente = await db.usuarios.findUnique({where: {usuarios:usuarios}})
 
        if(usuarioExistente && usuarioExistente.id!=req.params.id){
            return res.status(201).json({msgErr: 'El usuario ya existe'})
        } 

        // Hashea la contra
        const hasshedPassword = contrasena && await bcrypt.hash(contrasena, 10)

        const udUsuarios = await db.usuarios.update({
            where: {
                id: parseInt(req.params.id) 
            },
            data: {
                name: name,
                usuarios: usuarios,
                email: email,
                tipo: tipo,
                ...(contrasena ? {contrasena: hasshedPassword} : {}), 
                estado: estado,
            }
        })
        res.status(200).send({msg: 'Se actualizo el usuario'});
    } catch {
        res.status(401).send({msgErr: "Error interno en el API"});
    }
}

const getStatsUser = async(req, res) => {
    try{
        const [total, admins, bascula, tolva, contabilidad] = await Promise.all([
            db.usuarios.count(), 
            db.usuarios.count({where: {tipo: 'ADMINISTRADOR'}}),
            db.usuarios.count({where: {tipo: 'BASCULA'}}),
            db.usuarios.count({where: {tipo: 'TOLVA'}}),
            db.usuarios.count({where: {tipo: 'CONTABILIDAD'}}),
        ])

        res.status(201).send({total, admins, bascula, tolva, contabilidad})
    }catch(err) {
        console.log(err)
        res.status(401).send({msg:'Error interno en el API'})
    }
}

module.exports = {
    getUsuarios, postUsuarios, updateUsuarios, getStatsUser
}