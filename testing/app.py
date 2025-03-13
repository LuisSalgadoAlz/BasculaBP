import socket
import time

# Dirección IP y puerto del dispositivo (balanza)
host = '192.9.100.186'  # IP de la balanza
port = 10000            # Puerto de la balanza

try:

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect((host, port))
        print(f'Conectado a {host}:{port}')
        s.sendall(b'w\r\n') 
        time.sleep(0.1)
        data = b''
        while True:
            part = s.recv(1024)  
            data += part
            if len(part) < 1024: 
                break
        
        print(f'Respuesta de la balanza: {data.decode("ascii")}')
        
except ConnectionRefusedError:
    print(f'No se pudo conectar a {host}:{port}. Verifica la IP y el puerto.')
except Exception as e:
    print(f'Ocurrió un error: {e}')

