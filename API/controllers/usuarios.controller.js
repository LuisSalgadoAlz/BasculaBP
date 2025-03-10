const {PrismaClient} = require('@prisma/client')
const db = new PrismaClient()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/* Listar usuarios */
const getUsuarios = async (req, res) => {   
    const data = await db.usuarios.findMany()
    res.json(data)
}

/* Crear usuarios */
const postUsuarios = async (req, res) => {
    try{
        const {name, email, tipo, contrasena, usuario} = req.body
        const hasshedPassword = await bcrypt.hash(contrasena, 10)
        const result = await db.usuarios.create({
            data: {
                name: name,
                usuarios: usuario,
                email: email,
                tipo: tipo,
                contrasena: hasshedPassword
            }
        })
    }catch(error){
       res.status(400).json({msg: `Error al crear usuario: ${error}`})    
       console.log(error)
    }
    res.status(200).send("proceso exitoso");
}

/* Modificar usuarios */
const updateUsuarios = async (req, res) => {
    res.send("proceso exitoso");
}



module.exports = {
    getUsuarios, postUsuarios, updateUsuarios
}