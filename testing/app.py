import subprocess

# Rutas de los proyectos
ruta_frontend = r"C:\bascula\bascula"
ruta_backend = r"C:\bascula\api"

# Abrir un subproceso para el backend sin mostrar la terminal
subprocess.Popen([f'cmd', '/c', f'cd /d {ruta_backend} && npm run host'], creationflags=subprocess.CREATE_NO_WINDOW)

# Abrir un subproceso para el frontend sin mostrar la terminal
subprocess.Popen([f'cmd', '/c', f'cd /d {ruta_frontend} && npm run server'], creationflags=subprocess.CREATE_NO_WINDOW)