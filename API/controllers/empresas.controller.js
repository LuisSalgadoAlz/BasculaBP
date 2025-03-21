const {PrismaClient} = require('@prisma/client')
const dotenv = require('dotenv')
const db = new PrismaClient()

/* Listar usuarios */
const getEmpresas = async (req, res) => {   
    const data = await db.empresa.findMany()
    res.json(data)
}

const postEmpresas = async (req, res) => {
    try {
        const { nombre, email, telefono, descripcion } = req.body;

        // Crear el nuevo usuario
        const nuevaEmpresa = await db.empresa.create({
            data: {
                nombre,
                email,
                telefono,
                descripcion,
                estado: true
            }
        });

        // Responder con el usuario creado
        res.status(201).json({ msg: 'Usuario creado exitosamente', usuario: nuevaEmpresa });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: `Error al crear usuario: ${error.message}` });
    }
};


module.exports = {
    getEmpresas, postEmpresas
}