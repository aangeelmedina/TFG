# Backend — API REST

API REST desarrollada con **Flask** y **Flask-JWT-Extended**. Base de datos relacional gestionada con **SQLAlchemy** sobre MySQL.

La URL base en desarrollo es `http://localhost:5000`.

---

## Autenticación

La mayoría de los endpoints protegidos requieren un header:

```
Authorization: Bearer <token>
```

El token se obtiene en el endpoint `POST /auth/login`.

---

## Módulo de Usuarios (`/auth`)

### `POST /auth/login`
Inicia sesión y devuelve un JWT.

**Body JSON:**
```json
{ "username": "admin", "password": "secreto" }
```

**Respuesta 200:**
```json
{
  "user": { "id": 1, "username": "admin", "role": "superAdmin", "setPassword": false },
  "token": "<jwt>"
}
```

---

### `POST /auth/register`
Crea un nuevo usuario con contraseña temporal igual al username.

**Body JSON:**
```json
{ "username": "nuevo_usuario" }
```

**Respuesta 201:** `{ "message": "Usuario creado correctamente" }`

---

### `GET /auth/me` *(JWT requerido)*
Devuelve los datos del usuario autenticado.

**Respuesta 200:**
```json
{ "id": 1, "username": "admin", "role": "superAdmin", "setPassword": false }
```

---

### `POST /auth/set-password` *(JWT requerido)*
Cambia la contraseña temporal del usuario en su primer acceso. Requiere mínimo 6 caracteres.

**Body JSON:**
```json
{ "password": "nuevaContrasena" }
```

**Respuesta 200:** `{ "message": "Contraseña actualizada correctamente" }`

---

### `POST /auth/usuarios/<usuario_id>/reset-password` *(JWT requerido)*
Resetea la contraseña de un usuario a su username. Solo lo puede hacer un `superAdmin` o el `admin` del centro al que pertenece el usuario.

**Respuesta 200:** `{ "message": "Contraseña de <username> reseteada correctamente" }`

---

## Módulo de Centros

### `GET /centros`
Devuelve la lista de centros accesibles para el usuario.

**Query params:** `user_id=<id>`

- `superAdmin`: recibe todos los centros.
- Otros roles: solo los centros donde están asignados.

**Respuesta 200:** Array de objetos centro.

---

### `POST /centros/añadir`
Crea un nuevo centro. Solo disponible para `superAdmin`.

**Body JSON:**
```json
{
  "user": 1,
  "nombre": "Centro Ejemplo",
  "direccion": "Calle Mayor 1",
  "telefono": "600000000",
  "email": "centro@ejemplo.com"
}
```

**Respuesta 201:** Datos del centro creado.

---

### `DELETE /centro/<centro_id>` *(JWT requerido)*
Elimina un centro y todos sus datos asociados (usuarios asignados, pacientes y sus árboles). Solo `superAdmin`.

**Respuesta 200:** `{ "message": "Centro eliminado correctamente" }`

---

### `GET /usuarios`
Lista todos los usuarios que no son `superAdmin`, disponible para asignar a centros.

**Respuesta 200:** Array `[{ "id", "username", "rol" }]`

---

### `GET /centros/<centro_id>/usuarios`
Lista los usuarios asignados a un centro concreto.

**Respuesta 200:** Array con `{ id, usuario_id, username, rol, activo }`.

---

### `POST /centros/<centro_id>/asignar-usuario`
Asigna un usuario a un centro con un rol (`admin` o `terapeuta`). Si ya estaba asignado, actualiza su rol.

**Body JSON:**
```json
{ "usuario_id": 2, "rol": "terapeuta", "user_id": 1 }
```

**Respuesta 200:** `{ "message": "Usuario asignado como terapeuta correctamente" }`

---

### `DELETE /centros/<centro_id>/asignar-usuario/<usuario_id>`
Elimina la asignación de un usuario a un centro.

**Respuesta 200:** `{ "message": "Usuario eliminado del centro" }`

---

### `PATCH /centros/<centro_id>/usuarios/<usuario_id>/estado` *(JWT requerido)*
Activa o desactiva a un usuario dentro de un centro (toggle).

**Respuesta 200:** `{ "message": "Usuario marcado como activo|inactivo", "activo": true|false }`

---

## Módulo de Pacientes

### `GET /centros/<centro_id>/pacientes`
Lista los pacientes de un centro.

**Query params:** `user_id=<id>`

**Respuesta 200:** Array de pacientes.

---

### `POST /centros/<centro_id>/pacientes`
Crea un paciente en un centro.

**Body JSON:**
```json
{
  "nombre": "Juan",
  "apellidos": "García López",
  "dni": "12345678A",
  "edad": 45,
  "contacto": "600111222",
  "historial_medico": "Sin alergias conocidas",
  "estado": "En tratamiento",
  "fecha_ingreso": "2024-01-15",
  "user_id": 1
}
```

Estados válidos: `En tratamiento`, `Alta médica`, `Pendiente evaluación`, `Baja temporal`.

**Respuesta 201:** Datos del paciente creado.

---

### `PUT /pacientes/<paciente_id>`
Actualiza los datos de un paciente existente.

**Body JSON:** Mismos campos que la creación (solo los que se quieran modificar).

**Respuesta 200:** Datos del paciente actualizado.

---

### `DELETE /pacientes/<paciente_id>` *(JWT requerido)*
Elimina un paciente y todos sus datos.

**Respuesta 200:** `{ "message": "Paciente eliminado" }`

---

## Módulo de Nodos (Árboles de Decisión)

Todos los endpoints de este módulo tienen el prefijo `/api`.

### `GET /api/pacientes/<paciente_id>/arboles`
Devuelve los árboles de decisión de un paciente.

**Respuesta 200:** Array de árboles `[{ id, titulo, paciente_id, creado_en }]`.

---

### `POST /api/pacientes/<paciente_id>/arboles`
Crea un nuevo árbol con un nodo raíz "Inicio" automáticamente.

**Body JSON (opcional):**
```json
{ "titulo": "Mi árbol terapéutico" }
```

**Respuesta 201:** Árbol creado con su estructura completa de nodos.

---

### `GET /api/pacientes/<paciente_id>/arboles/<arbol_id>`
Devuelve un árbol completo con todos sus nodos en forma de árbol.

**Respuesta 200:** Árbol con nodos anidados.

---

### `PATCH /api/pacientes/<paciente_id>/arboles/<arbol_id>`
Renombra el título de un árbol.

**Body JSON:**
```json
{ "titulo": "Nuevo título" }
```

**Respuesta 200:** Árbol actualizado.

---

### `DELETE /api/pacientes/<paciente_id>/arboles/<arbol_id>`
Elimina un árbol y todos sus nodos.

**Respuesta 200:** `{ "eliminado": <arbol_id> }`

---

### `POST /api/pacientes/<paciente_id>/arboles/<arbol_id>/nodos`
Añade un nodo hijo a un nodo existente. Máximo 2 hijos por nodo.

**Body JSON:**
```json
{
  "padre_id": 1,
  "texto": "Opción A",
  "es_final": false
}
```

**Respuesta 201:** Datos del nodo creado.

---

### `PATCH /api/pacientes/<paciente_id>/arboles/<arbol_id>/nodos/<nodo_id>`
Edita el texto o el estado final de un nodo.

**Body JSON:**
```json
{ "texto": "Nuevo texto", "es_final": true }
```

**Respuesta 200:** Nodo actualizado.

---

### `DELETE /api/pacientes/<paciente_id>/arboles/<arbol_id>/nodos/<nodo_id>`
Elimina un nodo y todos sus descendientes. El nodo raíz no puede eliminarse.

**Respuesta 200:** `{ "eliminado": <nodo_id> }`

---

### `GET /api/pacientes/<paciente_id>/arboles/<arbol_id>/jugar`
Devuelve el nodo actual para la sesión de juego interactivo.

**Query params:** `nodo_id=<id>` (omitir para empezar desde la raíz)

**Respuesta 200:**
```json
{
  "id": 1,
  "texto": "¿Qué quieres hacer?",
  "es_final": false,
  "nivel": 0,
  "num_hijos": 2,
  "hijos": [
    { "id": 2, "texto": "Opción A", "es_final": false },
    { "id": 3, "texto": "Opción B", "es_final": true }
  ]
}
```

> **Lógica de navegación:** 1 hijo → clic simple avanza; 2 hijos → clic simple = `hijos[0]`, doble clic = `hijos[1]`; 0 hijos → nodo final.

---

### `POST /api/pacientes/<paciente_id>/arboles/<arbol_id>/nodos/<nodo_id>/ejecutar`
Registra que un nodo final ha sido alcanzado en una sesión de juego.

**Condición:** el nodo debe ser final (`es_final: true`).

**Respuesta 201:** Datos del registro de ejecución.

---

### `GET /api/pacientes/<paciente_id>/estadisticas/nodos`
Devuelve estadísticas de uso de los árboles y nodos finales del paciente.

**Respuesta 200:**
```json
{
  "total_ejecuciones": 10,
  "por_arbol": [
    {
      "arbol_id": 1,
      "titulo": "Mi árbol",
      "total_ejecuciones": 7,
      "nodos_finales": [
        { "nodo_id": 3, "texto": "Opción B", "veces": 5 }
      ]
    }
  ]
}
```

---

## Roles del sistema

| Rol | Permisos |
|-----|----------|
| `superAdmin` | Acceso total: gestión de centros, usuarios, pacientes y árboles |
| `admin` | Gestión de usuarios y pacientes dentro de sus centros asignados |
| `terapeuta` | Acceso a pacientes y árboles de sus centros asignados |

---

## Ejecución local

```bash
# Instalar dependencias
pip install -r requirements.txt

# Variables de entorno necesarias
DATABASE_URL=mysql+pymysql://user:pass@host/dbname
SECRET_KEY=clave_secreta

# Arrancar el servidor
python mainController.py
```

## Ejecución con Docker

```bash
docker-compose up --build
```
