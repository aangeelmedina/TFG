# Variables de Entorno para Railway

Este documento describe exactamente qué variables configurar en Railway para cada servicio.

---

## Servicio MySQL (Plugin de Railway)

Railway crea automáticamente las siguientes variables al añadir el plugin MySQL.  
**No las toques** — Railway las inyecta sólo en los servicios que las referencien:

| Variable          | Descripción                                  |
|-------------------|----------------------------------------------|
| `MYSQL_URL`       | URL completa de conexión                     |
| `MYSQLHOST`       | Hostname interno del servidor MySQL          |
| `MYSQLPORT`       | Puerto (normalmente `3306`)                  |
| `MYSQLDATABASE`   | Nombre de la base de datos                   |
| `MYSQLUSER`       | Usuario                                      |
| `MYSQLPASSWORD`   | Contraseña                                   |

---

## Servicio Backend

Configura estas variables manualmente en el panel de Railway → Backend → Variables:

| Variable        | Valor                                                                                              | Notas                                                                 |
|-----------------|----------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------|
| `DATABASE_URL`  | `mysql+pymysql://$MYSQLUSER:$MYSQLPASSWORD@$MYSQLHOST:$MYSQLPORT/$MYSQLDATABASE`                  | Railway permite referenciar otras variables con `$VAR`. Cópialo tal cual. |
| `SECRET_KEY`    | Cadena aleatoria larga (mínimo 32 caracteres)                                                     | Genera con: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `JWT_SECRET_KEY`| Cadena aleatoria larga distinta a SECRET_KEY                                                      | Genera igual que SECRET_KEY                                           |
| `CORS_ORIGINS`  | `https://TU-FRONTEND.up.railway.app`                                                              | URL pública del frontend en Railway. Actualizar tras crear el servicio frontend. |
| `PORT`          | **NO configurar** — Railway lo inyecta automáticamente                                             | gunicorn usa `$PORT` directamente                                     |

### Ejemplo de DATABASE_URL construida manualmente (alternativa):
```
mysql+pymysql://usuario:contraseña@host.railway.internal:3306/nombre_db
```

---

## Servicio Frontend

| Variable       | Valor                                            | Notas                                                                                  |
|----------------|--------------------------------------------------|----------------------------------------------------------------------------------------|
| `VITE_API_URL` | `https://TU-BACKEND.up.railway.app`              | URL pública del backend. **Se quema en el build** — cambiarla requiere redesplegar.    |

> **IMPORTANTE**: `VITE_API_URL` es un **ARG de build-time** en el Dockerfile.  
> Railway pasa las variables de entorno como ARGs de build automáticamente si el Dockerfile los declara con `ARG VITE_API_URL`.  
> Actualmente el `frontend/Dockerfile` ya declara: `ARG VITE_API_URL=http://localhost:5000`.

---

## Notas de Seguridad

- Nunca uses las mismas claves secretas en producción que en desarrollo.
- `SESSION_COOKIE_SECURE` está actualmente en `False` en `clases.py`. Considera ponerlo en `True` en producción si usas HTTPS (Railway usa HTTPS por defecto).
- El seed (`seed.py`) se ejecuta cada arranque del contenedor — es idempotente (no duplica datos), pero en producción considera desactivarlo tras el primer deploy.
