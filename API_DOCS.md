# XStore API — Documentación de Endpoints

**Base URL:** `http://localhost:5210`  
**Swagger UI:** `http://localhost:5210/swagger` (solo en desarrollo)  
**CORS:** habilitado para cualquier origen — el frontend puede consumir la API directamente sin configuración adicional.

---

## Formato de respuesta

Todos los endpoints devuelven el mismo envelope JSON:

```json
{
  "success": true,
  "message": "Descripción del resultado.",
  "data": null
}
```

- `success` — `true` si la operación fue exitosa, `false` si hubo error.
- `message` — texto descriptivo del resultado.
- `data` — resultado de consultas (array de objetos); `null` en operaciones de escritura.

### Errores

| Código | Cuándo ocurre                                                     |
| ------ | ----------------------------------------------------------------- |
| `400`  | Error de base de datos (datos inválidos, violación de constraint) |
| `500`  | Error inesperado del servidor                                     |

```json
{
  "success": false,
  "message": "Descripción del error."
}
```

---

## Integración desde el frontend

### Función base recomendada

```js
const API_BASE = "http://localhost:5210";

async function apiCall(method, path, body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, options);
  const json = await res.json();

  if (!json.success) throw new Error(json.message);
  return json.data;
}
```

### Ejemplos de uso

```js
// GET con query params
const roles = await apiCall("GET", `/api/roles?nombreUsuario=admin`);

// POST con body
await apiCall("POST", "/api/roles", { nombreUsuario: "admin", nombre: "Vendedor", accesos: "ventas,inventario" });

// PUT con body
await apiCall("PUT", "/api/roles", { nombreUsuario: "admin", nombre: "Vendedor", nuevoNombre: "Cajero" });
```

> **Nota sobre auditorías:** el frontend debe llamar a `POST /api/auditorias` después de cada operación importante (crear, modificar) para registrar la trazabilidad.

---

## Endpoints

### Health

#### `GET /api/health`

Verifica que la API está funcionando.

**Respuesta:**

```json
{ "success": true, "message": "API XStore funcionando.", "data": null }
```

---

### Sesiones (Login)

#### `POST /api/sesiones/verificar`

Verifica credenciales de un usuario (login). Retorna los datos del usuario si son válidas.

**Body:**

```json
{
  "nombreUsuario": "jperez",
  "passwordHash": "abc123hash"
}
```

| Campo           | Tipo   | Requerido | Descripción                   |
| --------------- | ------ | --------- | ----------------------------- |
| `nombreUsuario` | string | Sí        | Nombre de usuario del sistema |
| `passwordHash`  | string | Sí        | Hash de la contraseña         |

**Respuesta `data`:** array con los datos del usuario autenticado.

---

#### `POST /api/sesiones`

Registra una nueva sesión de usuario (uso interno / creación de cuenta).

**Body:**

```json
{
  "creadorCuenta": "admin",
  "personaId": 1,
  "nombreUsuario": "jperez",
  "passwordHash": "abc123hash",
  "nombreRol": "Administrador"
}
```

| Campo           | Tipo   | Requerido | Descripción                   |
| --------------- | ------ | --------- | ----------------------------- |
| `creadorCuenta` | string | No        | Usuario que creó la cuenta    |
| `personaId`     | number | Sí        | ID de la persona asociada     |
| `nombreUsuario` | string | Sí        | Nombre de usuario del sistema |
| `passwordHash`  | string | Sí        | Hash de la contraseña         |
| `nombreRol`     | string | Sí        | Rol asignado                  |

---

### Roles

#### `GET /api/roles?nombreUsuario={nombreUsuario}`

Lista todos los roles disponibles.

| Param           | Tipo   | Descripción                                 |
| --------------- | ------ | ------------------------------------------- |
| `nombreUsuario` | string | Usuario que realiza la consulta (auditoría) |

**Respuesta `data`:** array de objetos con los roles.

---

#### `POST /api/roles`

Registra un nuevo rol.

**Body:**

```json
{
  "nombreUsuario": "admin",
  "nombre": "Vendedor",
  "accesos": "ventas,inventario"
}
```

| Campo           | Tipo   | Requerido | Descripción                                                 |
| --------------- | ------ | --------- | ----------------------------------------------------------- |
| `nombreUsuario` | string | Sí        | Usuario que ejecuta la acción                               |
| `nombre`        | string | Sí        | Nombre del rol                                              |
| `accesos`       | string | Sí        | Permisos del rol (formato libre, ej: `"ventas,inventario"`) |

---

#### `PUT /api/roles`

Modifica un rol existente. Solo se envían los campos a cambiar.

**Body:**

```json
{
  "nombreUsuario": "admin",
  "nombre": "Vendedor",
  "nuevoNombre": "Cajero",
  "nuevosAccesos": "ventas",
  "nuevoEstado": true
}
```

| Campo           | Tipo    | Requerido | Descripción                           |
| --------------- | ------- | --------- | ------------------------------------- |
| `nombreUsuario` | string  | Sí        | Usuario que ejecuta la acción         |
| `nombre`        | string  | Sí        | Nombre actual del rol (identificador) |
| `nuevoNombre`   | string  | No        | Nuevo nombre                          |
| `nuevosAccesos` | string  | No        | Nuevos permisos                       |
| `nuevoEstado`   | boolean | No        | `true` activo, `false` inactivo       |

---

### Tipos de Producto

#### `GET /api/tipos-productos?nombreUsuario={nombreUsuario}`

Lista todos los tipos de producto.

---

#### `POST /api/tipos-productos`

Registra un nuevo tipo de producto.

**Body:**

```json
{
  "nombreUsuario": "admin",
  "nombre": "Electrónico"
}
```

---

#### `PUT /api/tipos-productos`

Modifica un tipo de producto existente.

**Body:**

```json
{
  "nombreUsuario": "admin",
  "nombre": "Electrónico",
  "nuevoNombre": "Tecnología",
  "nuevoEstado": true
}
```

| Campo         | Requerido | Descripción                   |
| ------------- | --------- | ----------------------------- |
| `nombre`      | Sí        | Nombre actual (identificador) |
| `nuevoNombre` | No        | Nuevo nombre                  |
| `nuevoEstado` | No        | Estado activo/inactivo        |

---

### Marcas de Producto

#### `GET /api/marcas-productos?nombreUsuario={nombreUsuario}`

Lista todas las marcas de producto.

---

#### `POST /api/marcas-productos`

Registra una nueva marca.

**Body:**

```json
{
  "nombreUsuario": "admin",
  "nombre": "Samsung"
}
```

---

#### `PUT /api/marcas-productos`

Modifica una marca existente.

**Body:**

```json
{
  "nombreUsuario": "admin",
  "nombre": "Samsung",
  "nuevoNombre": "Samsung Electronics",
  "nuevoEstado": true
}
```

---

### Ubicaciones

#### `GET /api/ubicaciones?nombreUsuario={nombreUsuario}`

Lista todas las ubicaciones de almacén.

---

#### `POST /api/ubicaciones`

Registra una nueva ubicación.

**Body:**

```json
{
  "nombreUsuario": "admin",
  "nombre": "Bodega A"
}
```

---

#### `PUT /api/ubicaciones`

Modifica una ubicación existente.

**Body:**

```json
{
  "nombreUsuario": "admin",
  "nombre": "Bodega A",
  "nuevoNombre": "Bodega Principal",
  "nuevoEstado": true
}
```

---

### Tipos de Persona

#### `GET /api/tipos-personas?nombreUsuario={nombreUsuario}`

Lista todos los tipos de persona (ej: cliente regular, VIP, mayorista).

---

#### `POST /api/tipos-personas`

Registra un nuevo tipo de persona.

**Body:**

```json
{
  "nombreUsuario": "admin",
  "nombre": "VIP",
  "descuentoPct": 15.0,
  "montoMeta": 5000.0
}
```

| Campo          | Tipo    | Descripción                     |
| -------------- | ------- | ------------------------------- |
| `nombre`       | string  | Nombre del tipo                 |
| `descuentoPct` | decimal | Porcentaje de descuento (0-100) |
| `montoMeta`    | decimal | Monto de compra objetivo        |

---

#### `PUT /api/tipos-personas`

Modifica un tipo de persona existente.

**Body:**

```json
{
  "nombreUsuario": "admin",
  "nombre": "VIP",
  "nuevoNombre": "Cliente VIP",
  "nuevoDescuentoPct": 20.0,
  "nuevoMontoMeta": 6000.0,
  "nuevoEstado": true
}
```

| Campo               | Requerido | Descripción                            |
| ------------------- | --------- | -------------------------------------- |
| `nombre`            | Sí        | Nombre actual del tipo (identificador) |
| `nuevoNombre`       | No        | Nuevo nombre                           |
| `nuevoDescuentoPct` | No        | Nuevo porcentaje de descuento          |
| `nuevoMontoMeta`    | No        | Nuevo monto objetivo                   |
| `nuevoEstado`       | No        | Estado activo/inactivo                 |

---

### Personas

#### `GET /api/personas?nombreUsuario={nombreUsuario}&filtro={filtro}&busqueda={busqueda}`

Consulta personas (clientes/usuarios).

| Param           | Tipo   | Requerido | Descripción                                              |
| --------------- | ------ | --------- | -------------------------------------------------------- |
| `nombreUsuario` | string | Sí        | Usuario que consulta                                     |
| `filtro`        | string | No        | Filtro de categoría; por defecto `"TODOS"`               |
| `busqueda`      | string | No        | Texto libre para buscar por nombre, identificación, etc. |

---

#### `POST /api/usuarios`

Registra un nuevo usuario del sistema (crea persona + credenciales de acceso).

**Body:**

```json
{
  "nombreUsuario": "admin",
  "identificacion": "1-1234-5678",
  "nombreCompleto": "Juan Pérez",
  "telefono": "8888-8888",
  "correo": "juan@ejemplo.com",
  "direccion": "San José, Costa Rica",
  "newUser": "jperez",
  "passwordHash": "hash_de_la_contraseña",
  "nombreRol": "Vendedor",
  "esProveedor": false
}
```

| Campo            | Tipo    | Requerido | Descripción                                                 |
| ---------------- | ------- | --------- | ----------------------------------------------------------- |
| `nombreUsuario`  | string  | No        | Admin responsable de la creación (null si es auto-registro) |
| `identificacion` | string  | Sí        | Cédula u identificación                                     |
| `nombreCompleto` | string  | Sí        | Nombre completo                                             |
| `telefono`       | string  | No        | Teléfono                                                    |
| `correo`         | string  | No        | Correo electrónico                                          |
| `direccion`      | string  | No        | Dirección                                                   |
| `newUser`        | string  | Sí        | Username de login                                           |
| `passwordHash`   | string  | Sí        | Contraseña hasheada                                         |
| `nombreRol`      | string  | Sí        | Rol asignado                                                |
| `esProveedor`    | boolean | No        | `true` si es un proveedor; por defecto `false`              |

---

#### `PUT /api/personas`

Modifica datos de una persona existente.

**Body:**

```json
{
  "nombreUsuario": "admin",
  "personaId": 5,
  "nuevaIdentificacion": "1-1234-9999",
  "nuevoNombreCompleto": "Juan A. Pérez",
  "nuevoTelefono": "7777-7777",
  "nuevoCorreo": "juanperez@ejemplo.com",
  "nuevaDireccion": "Heredia, Costa Rica",
  "nuevoEstado": true
}
```

| Campo        | Requerido | Descripción                  |
| ------------ | --------- | ---------------------------- |
| `personaId`  | Sí        | ID de la persona a modificar |
| demás campos | No        | Solo enviar los que cambian  |

---

### Proveedores

#### `GET /api/proveedores/nombres?nombreUsuario={nombreUsuario}`

Retorna la lista de nombres de proveedores (útil para dropdowns/selects).

| Param           | Tipo   | Descripción                     |
| --------------- | ------ | ------------------------------- |
| `nombreUsuario` | string | Usuario que realiza la consulta |

---

#### `POST /api/proveedores`

Registra un nuevo proveedor.

**Body:**

```json
{
  "nombreUsuario": "admin",
  "identificacion": "3-101-123456",
  "nombreCompleto": "Distribuidora XYZ S.A.",
  "telefono": "2222-2222",
  "correo": "contacto@xyz.com",
  "direccion": "Alajuela, Costa Rica"
}
```

| Campo            | Tipo   | Requerido |
| ---------------- | ------ | --------- |
| `nombreUsuario`  | string | Sí        |
| `identificacion` | string | Sí        |
| `nombreCompleto` | string | Sí        |
| `telefono`       | string | No        |
| `correo`         | string | No        |
| `direccion`      | string | No        |

---

#### `PUT /api/proveedores`

Modifica un proveedor existente.

**Body:**

```json
{
  "nombreUsuario": "admin",
  "proveedorId": 3,
  "nuevaIdentificacion": "3-101-999999",
  "nuevoNombreCompleto": "Distribuidora XYZ Internacional",
  "nuevoTelefono": "2233-2233",
  "nuevoCorreo": "ventas@xyz.com",
  "nuevaDireccion": "Cartago, Costa Rica",
  "nuevoEstado": true
}
```

| Campo         | Requerido | Descripción                  |
| ------------- | --------- | ---------------------------- |
| `proveedorId` | Sí        | ID del proveedor a modificar |
| demás campos  | No        | Solo enviar los que cambian  |

---

### Categorías de Descuento

#### `GET /api/cat-descuentos?nombreUsuario={nombreUsuario}`

Lista todas las categorías de descuento.

---

#### `POST /api/cat-descuentos`

Registra una nueva categoría de descuento.

**Body:**

```json
{
  "nombreUsuario": "admin",
  "nombre": "Descuento Navideño"
}
```

---

#### `PUT /api/cat-descuentos`

Modifica una categoría de descuento existente.

**Body:**

```json
{
  "nombreUsuario": "admin",
  "nombre": "Descuento Navideño",
  "nuevoNombre": "Descuento Fin de Año",
  "nuevoEstado": true
}
```

| Campo         | Requerido | Descripción                   |
| ------------- | --------- | ----------------------------- |
| `nombre`      | Sí        | Nombre actual (identificador) |
| `nuevoNombre` | No        | Nuevo nombre                  |
| `nuevoEstado` | No        | Estado activo/inactivo        |

---

### Estados de Entrega

#### `GET /api/estados-entregas?nombreUsuario={nombreUsuario}`

Lista todos los estados de entrega (ej: Pendiente, En camino, Entregado).

---

#### `POST /api/estados-entregas`

Registra un nuevo estado de entrega.

**Body:**

```json
{
  "nombreUsuario": "admin",
  "nombre": "En camino"
}
```

---

#### `PUT /api/estados-entregas`

Modifica un estado de entrega existente.

**Body:**

```json
{
  "nombreUsuario": "admin",
  "nombre": "En camino",
  "nuevoNombre": "En tránsito",
  "nuevoEstado": true
}
```

| Campo         | Requerido | Descripción                   |
| ------------- | --------- | ----------------------------- |
| `nombre`      | Sí        | Nombre actual (identificador) |
| `nuevoNombre` | No        | Nuevo nombre                  |
| `nuevoEstado` | No        | Estado activo/inactivo        |

---

### Auditorías

#### `GET /api/auditorias?nombreUsuario={nombreUsuario}&fechaFiltro={fecha}&tablaFiltro={tabla}`

Consulta el registro de auditoría.

| Param           | Tipo     | Requerido | Descripción                                              |
| --------------- | -------- | --------- | -------------------------------------------------------- |
| `nombreUsuario` | string   | Sí        | Usuario que consulta                                     |
| `fechaFiltro`   | datetime | No        | Filtrar por fecha (ISO 8601: `2026-04-02T00:00:00`)      |
| `tablaFiltro`   | string   | No        | Filtrar por tabla afectada (ej: `"ROLES"`, `"PERSONAS"`) |

---

#### `POST /api/auditorias`

Registra una entrada de auditoría. **El frontend debe llamar este endpoint después de cada operación de escritura.**

**Body:**

```json
{
  "personaId": 1,
  "accion": "UPDATE",
  "tablaAfectada": "ROLES",
  "filaAfectada": 3,
  "descripcion": "Se modificó el nombre del rol",
  "antes": "{\"nombre\": \"Vendedor\"}",
  "despues": "{\"nombre\": \"Cajero\"}"
}
```

| Campo           | Tipo   | Requerido | Descripción                                                    |
| --------------- | ------ | --------- | -------------------------------------------------------------- |
| `personaId`     | number | Sí        | ID del usuario que realizó la acción                           |
| `accion`        | string | Sí        | Tipo de acción: `"SELECT"`, `"INSERT"`, `"UPDATE"`, `"DELETE"` |
| `tablaAfectada` | string | Sí        | Nombre de la tabla afectada                                    |
| `filaAfectada`  | number | Sí        | ID del registro afectado (0 para SELECT)                       |
| `descripcion`   | string | Sí        | Descripción legible de lo que se hizo                          |
| `antes`         | string | No        | JSON stringify del estado anterior                             |
| `despues`       | string | No        | JSON stringify del estado nuevo                                |

//1. Health — ping de salud de la API  
 //2. Sesiones — login (/verificar) y creación de cuenta  
 //3. Roles — CRUD de roles del sistema  
 //4. Tipos de Producto — CRUD de tipos/categorías de producto  
 //5. Marcas de Producto — CRUD de marcas  
 //6. Ubicaciones — CRUD de ubicaciones de almacén  
 7. Tipos de Persona — CRUD de tipos de cliente (con descuento % y monto meta) ?? 8. Personas — consulta y edición de clientes/usuarios  
 9. Usuarios — creación de usuario (persona + credenciales en un endpoint)  
 10. Proveedores — CRUD de proveedores + endpoint de nombres para dropdowns  
 //11. Categorías de Descuento — CRUD de categorías de descuento  
 //12. Estados de Entrega — CRUD de estados de entrega (Pendiente, En camino, etc.)  
 13. Auditorías — consulta y registro de auditoría
