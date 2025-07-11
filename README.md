# Documentación de Instalación - Sistema de Báscula API

## 🌟 Vista Previa del Sistema

Explore nuestro flujograma interactivo para entender la arquitectura y funcionamiento del sistema:
[Ver Prototipo en Figma](https://www.figma.com/proto/YNUA9gEjdj5POqPRxfUnGi/Untitled?node-id=3-417&p=f&t=wNv0eYJIr3mmPEk3-1&scaling=contain&content-scaling=fixed&page-id=0%3A1)

*Última actualización: 20/03/2025*

## 🚀 Configuración Inicial

### Parámetros de Conexión

Para establecer la conexión correcta con nuestra base de datos y servicios, configure las siguientes variables de entorno:

```bash
# Archivo .env
DATABASE_URL="sqlserver://localhost:1433;database=Bascula_API;user=sa;password=123;encrypt=true;trustServerCertificate=true;connection_limit=25;connectionTimeout=30000;requestTimeout=30000;pool_timeout=30000;idleTimeoutMillis=30000"
PORT=3000
SECRET_KEY="Coloque la palabra"
HOST='192.9.100.56'
```

### Configuración del Host

Actualice la variable `URLHOST` en el archivo `./src/constants/global.js`:

```javascript
// Dirección del servidor
URLHOST = 'http://URLHOST:3000/'
```

## 📋 Requisitos del Sistema

- Node.js v16 o superior
- SQL Server 2019+
- 2GB RAM mínimo recomendado
- Conexión a la red interna
- Pm2

## 🔧 Instalación

1. Clone el repositorio
   ```bash
   git clone https://github.com/su-organizacion/bascula-api.git
   ```

2. Instale las dependencias
   ```bash
   npm install
   ```

3. Configure las variables de entorno como se indicó anteriormente

4. Inicie el servidor
   ```bash
   npm run server
   ```

## 💡 Verificación

Una vez iniciado, verifique que el sistema funciona correctamente accediendo a:
```
http://URLHOST:3000/
```

## 📞 Soporte

¿Necesita ayuda? Contáctenos:
- Correo: luissalgado877878@gmail.com

---

© 2025 Luis Armando Salgado Almendarez - Todos los derechos reservados