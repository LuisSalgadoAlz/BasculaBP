const db = require('../lib/prisma')
const dotenv = require('dotenv')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/* Listar usuarios */
const getUsuarios = async (req, res) => {   
    try{
        const data = await db.usuarios.findMany()
        const refactorData = data.map((item)=>({
            ...item, estado: item.estado ? 'Activo' : 'Inactivo'
        }))
        res.json(refactorData)
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

module.exports = {
    getUsuarios, postUsuarios, updateUsuarios
}