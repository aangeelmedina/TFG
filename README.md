# 🐳 Dockerización del TFG

## Estructura de archivos para Docker

```
TFG/
├── docker-compose.yml          
├── backend/
│   ├── Dockerfile              
│   ├── entrypoint.sh           
│   ├── seed.py                 
│   ├── requirements.txt        
│   ├── .env                    
│   ├── .dockerignore           
│   ├── mainController.py       
│   ├── clases.py               
│   └── ...resto del backend
└── frontend/
    ├── Dockerfile              
    ├── nginx.conf              
    ├── .dockerignore           
    └── ...resto del frontend
```

## ▶️ Arrancar por primera vez

```bash
# Desde la carpeta raíz TFG/
docker compose up --build
```

Esto:
1. Levanta MySQL 8 con la BD `tfg_db` y el usuario `admin`/`admin`
2. Espera a que MySQL esté sano (healthcheck)
3. Ejecuta `seed.py` → crea el usuario admin con contraseña `admin`
4. Arranca Flask en el puerto 5000
5. Construye el frontend React y lo sirve con Nginx en el puerto 80

## 🌐 Acceder a la app

| Servicio   | URL                      |
|------------|--------------------------|
| Frontend   | http://localhost         |
| Backend    | http://localhost:5000    |
| MySQL      | localhost:3306           |

## 👤 Usuario inicial

| Campo      | Valor  |
|------------|--------|
| Username   | admin  |
| Contraseña | admin  |
| Rol        | superAdmin  |

## 🔄 Comandos útiles

```bash
# Parar todo
docker compose down

# Parar y borrar la BD (para empezar desde cero)
docker compose down -v

# Ver logs del backend
docker compose logs -f backend

# Ver logs de MySQL
docker compose logs -f mysql

# Reconstruir solo el frontend (tras cambios en el código)
docker compose up --build frontend
```

## ⚠️ Importante: VITE_API_URL en producción Docker

En Docker, el frontend usa rutas relativas y Nginx hace de proxy hacia el backend.
Por eso `VITE_API_URL` se deja vacío en el docker-compose.

Si en algún momento necesitas que el frontend llame directamente al backend
(sin pasar por Nginx), cambia en `docker-compose.yml`:
```yaml
VITE_API_URL: "http://localhost:5000"
```
Y reconstruye: `docker compose up --build frontend`