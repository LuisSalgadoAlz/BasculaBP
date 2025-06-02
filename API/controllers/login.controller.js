const db = require('../lib/prisma')
const dotenv = require('dotenv')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {setLogger} = require('../utils/logger');

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
                usuarios: usuarios,
            }
        })

        // Verifica si el usuario existe, y si existe verifica si la contraseña es correcta
        if(usuario){
            if (usuario.estado==true) {
                const match = await bcrypt.compare(contrasena, usuario.contrasena)
                if(match){
                    // Si las contras son iguales, se crea el token con la "secret key"
                    const token = jwt.sign({usuarios: usuario.usuarios}, process.env.SECRET_KEY)

                    setLogger('LOGIN', 'INICIAR SESSION', req, usuario)  
                    
                    return res.json({
                        token: token, 
                        type: usuario.tipo, 
                        name: usuario.name,
                    })
                }
                return res.status(401).json({msg: 'Credenciales incorrectas'})
            }
            return res.status(404).json({msg:'Usuario desactivado, comunicarse con IT'})
        }
        res.status(404).json({msg: 'Credenciales incorrectas'})
    }catch(error){
        console.error(error)
        res.status(500).json({msg: `Error al iniciar sesión: ${error.message}`})
    }
}

module.exports = loginUsers;