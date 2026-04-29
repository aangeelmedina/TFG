# Guía de Despliegue en Railway

Esta guía asume que el repositorio está en GitHub y que ya tienes cuenta en [railway.app](https://railway.app).

---

## Paso 1 — Crear el proyecto en Railway

1. Entra en [railway.app/new](https://railway.app/new).
2. Selecciona **"Empty Project"**.
3. Dale un nombre al proyecto (ej: `tfg-app`).

---

## Paso 2 — Añadir el plugin MySQL

1. Dentro del proyecto, haz clic en **"+ New"** → **"Database"** → **"Add MySQL"**.
2. Railway creará el servicio MySQL y generará automáticamente las credenciales.
3. Haz clic en el servicio MySQL → pestaña **"Variables"** y anota los valores de:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLDATABASE`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQL_URL`

> Estos valores se usarán para construir `DATABASE_URL` en el backend.

---

## Paso 3 — Desplegar el Backend

1. Haz clic en **"+ New"** → **"GitHub Repo"**.
2. Selecciona tu repositorio y cuando Railway pregunte por la carpeta raíz, escribe: `/backend`.
3. Railway detectará el `Dockerfile` y `railway.toml` automáticamente.

### 3.1 Configurar variables de entorno del backend

En el servicio backend → pestaña **"Variables"**, añade:

```
DATABASE_URL  = mysql+pymysql://$MYSQLUSER:$MYSQLPASSWORD@$MYSQLHOST:$MYSQLPORT/$MYSQLDATABASE
SECRET_KEY    = <genera con: python -c "import secrets; print(secrets.token_hex(32))">
JWT_SECRET_KEY = <genera otra clave distinta>
CORS_ORIGINS  = https://TU-FRONTEND.up.railway.app   ← actualizar en el Paso 6
```

> Para `DATABASE_URL`, Railway resuelve las referencias `$VARIABLE` automáticamente si el MySQL está en el mismo proyecto.

### 3.2 Verificar el deploy del backend

- Espera a que el deploy complete (estado verde).
- Abre la URL pública del backend (Railway → Settings → Domains → Generate Domain).
- Verifica que `https://TU-BACKEND.up.railway.app/health` devuelve:
  ```json
  {"status": "ok"}
  ```

---

## Paso 4 — Desplegar el Frontend

1. Haz clic en **"+ New"** → **"GitHub Repo"**.
2. Selecciona el mismo repositorio y carpeta raíz: `/frontend`.

### 4.1 Configurar VITE_API_URL

En el servicio frontend → pestaña **"Variables"**, añade **ANTES de que arranque el primer build**:

```
VITE_API_URL = https://TU-BACKEND.up.railway.app
```

> **Crítico**: Este valor se quema en el bundle de Vite durante el build. Si lo cambias después, debes hacer un redeploy manual (Railway → Deploy → Trigger Redeploy).

### 4.2 Verificar que el ARG llega al build

El `frontend/Dockerfile` declara `ARG VITE_API_URL=http://localhost:5000`.  
Railway pasa las variables de entorno como ARGs de build automáticamente.  
Puedes confirmarlo en los logs de build buscando la línea: `ENV VITE_API_URL=https://...`

---

## Paso 5 — Configurar dominios públicos

Para cada servicio (backend y frontend):

1. Servicio → **"Settings"** → **"Networking"** → **"Generate Domain"**.
2. Anota las URLs generadas:
   - Backend: `https://tfg-backend-XXXX.up.railway.app`
   - Frontend: `https://tfg-frontend-XXXX.up.railway.app`

---

## Paso 6 — Actualizar CORS_ORIGINS en el Backend

Ahora que tienes la URL del frontend:

1. Ve al servicio backend → **"Variables"**.
2. Actualiza `CORS_ORIGINS`:
   ```
   CORS_ORIGINS = https://tfg-frontend-XXXX.up.railway.app
   ```
3. Railway hará un redeploy automático.

---

## Paso 7 — Verificar la base de datos

El `seed.py` se ejecuta automáticamente al arrancar el contenedor backend (vía `entrypoint.sh`).  
Crea las tablas con `db.create_all()` e inserta datos de prueba si no existen.

### Si necesitas ejecutar migraciones manualmente (Alembic / Flask-Migrate):

Railway permite abrir una terminal en el contenedor en ejecución:

1. Servicio Backend → **"Deploy"** → botón **"..."** → **"Railway Shell"** (o usa la CLI de Railway).
2. Ejecuta:
   ```bash
   # Si usas Flask-Migrate:
   flask db upgrade
   
   # Si usas Alembic directamente:
   alembic upgrade head
   ```

Usando la CLI de Railway desde tu máquina local:
```bash
# Instalar CLI
npm i -g @railway/cli

# Login
railway login

# Conectar al proyecto
railway link

# Ejecutar comando en el servicio backend
railway run --service backend python seed.py
```

---

## Paso 8 — Checklist Final de Verificación

- [ ] `/health` del backend devuelve `{"status": "ok"}`
- [ ] El frontend carga en su URL pública sin errores de consola
- [ ] Las peticiones de red en DevTools van a `https://TU-BACKEND.up.railway.app/*` (no a localhost)
- [ ] El login funciona correctamente
- [ ] No aparecen errores de CORS en la consola del navegador
- [ ] Las credenciales del seed están funcionando (usuario `admin`, contraseña `admin`)
- [ ] MySQL tiene todas las tablas (`usuarios`, `centros`, `pacientes`, `nodos`, `arboles_decision`)

---

## Solución de Problemas Frecuentes

### Error: `502 Bad Gateway` en el frontend
- El frontend está intentando conectar con el backend pero la URL no es correcta.
- Verifica `VITE_API_URL` y haz un redeploy del frontend.

### Error: `CORS policy` en el navegador
- Revisa que `CORS_ORIGINS` en el backend contenga exactamente la URL del frontend (sin `/` final).

### El backend no conecta a MySQL
- Verifica que `DATABASE_URL` usa el formato `mysql+pymysql://...` (no `mysql://`).
- Comprueba que el plugin MySQL y el backend están en el **mismo proyecto** de Railway.

### El build del frontend ignora VITE_API_URL
- En Railway, las variables de entorno se pasan como ARGs de build automáticamente.
- Si el Dockerfile no tiene `ARG VITE_API_URL`, el ARG no llega. Verifica `frontend/Dockerfile`.

### seed.py falla en producción
- Verifica que `DATABASE_URL` está correctamente configurada antes del primer deploy.
- El seed es idempotente: si las tablas ya existen, no duplica datos.
