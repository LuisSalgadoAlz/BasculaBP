const {PrismaClient} = require('@prisma/client')
const dotenv = require('dotenv')
const db = new PrismaClient()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/* Listar usuarios */
const getUsuarios = async (req, res) => {   
    const data = await db.usuarios.findMany()
    res.json(data)
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
            return res.status(400).json({ msg: 'El usuario ya existe' });
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
                contrasena: hashedPassword
            }
        });

        // Responder con el usuario creado
        res.status(201).json({ msg: 'Usuario creado exitosamente', usuario: nuevoUsuario });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: `Error al crear usuario: ${error.message}` });
    }
};

/* Modificar usuarios */
const updateUsuarios = async (req, res) => {
    const {name, email, tipo, contrasena, usuarios} = req.body
    
    // Verifica si el usuario que quiere modicar ya exista
    const usuarioExistente = await bucarUsuario(usuarios)
    if(usuarioExistente){
        return res.status(400).json({msg: 'El usuario ya existe'})
    } 

    // Hashea la contra
    const hasshedPassword = await bcrypt.hash(contrasena, 10)

    const udUsuarios = await db.usuarios.update({
        where: {
            id: parseInt(req.params.id) 
        },
        data: {
            name: name,
            usuarios: usuarios,
            email: email,
            tipo: tipo,
            contrasena: hasshedPassword
        }
    })
    res.status(200).send("proceso exitoso");
}

/* Funcion para utilizar en el login a futuro mas el access w token */
const loginUsers = async (req, res) => {
    const {usuarios, contrasena} = req.body

    if (!usuarios || !contrasena) {
        return res.json({msg: 'Por favor, ingrese los datos'}) 
    }

    try{
        // Buscar el usuario para ingresar al sistema
        const usuario = await db.usuarios.findUnique({
            where: {
                usuarios: usuarios
            }
        })

        // Verifica si el usuario existe, y si existe verifica si la contraseña es correcta
        if(usuario){
            const match = await bcrypt.compare(contrasena, usuario.contrasena)
            if(match){
                // Si las contras son iguales, se crea el token con la "secret key"
                const token = jwt.sign({usuarios: usuario.usuarios}, process.env.SECRET_KEY)  
                return res.json({
                    token: token
                })
            }
            return res.status(401).json({"msg": 'Credenciales incorrectas'})
        }
        res.status(404).json({msg: 'Usuario no encontrado'})
    }catch(error){
        console.error(error)
        res.status(500).json({msg: `Error al iniciar sesión: ${error.message}`})
    }
}

module.exports = {
    getUsuarios, postUsuarios, updateUsuarios, loginUsers
}