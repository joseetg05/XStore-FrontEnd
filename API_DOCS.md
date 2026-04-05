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

## Autenticación

Todos los endpoints marcados con 🔒 requieren un token JWT en el header:

```
Authorization: Bearer {token}
```

El token se obtiene al llamar `POST /api/sesiones/verificar`.

---

## Integración desde el frontend

### Función base recomendada

```js
const API_BASE = "http://localhost:5210";

async function apiCall(method, path, body = null, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, options);
  const json = await res.json();

  if (!json.success) throw new Error(json.message);
  return json.data;
}
```

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

#### `POST /api/sesiones/verificar` — público

Verifica credenciales de un usuario (login). Retorna un token JWT.

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

**Respuesta `data`:**

```json
{
  "token": "eyJ...",
  "nombreRol": "Administrador",
  "accesos": "ventas,inventario"
}
```

---

#### `POST /api/sesiones` 🔒

Registra credenciales de login a una persona ya existente en el sistema.

**Body:**

```json
{
  "creadorCuenta": "admin",
  "identificacion": "1-1234-5678",
  "nombreUsuario": "jperez",
  "passwordHash": "abc123hash",
  "nombreRol": "Vendedor"
}
```

| Campo            | Tipo   | Requerido | Descripción                                                      |
| ---------------- | ------ | --------- | ---------------------------------------------------------------- |
| `creadorCuenta`  | string | No        | Admin que crea la cuenta (`null` = auto-registro)                |
| `identificacion` | string | Sí        | Identificación de la persona a la que se le asignan credenciales |
| `nombreUsuario`  | string | Sí        | Username de login                                                |
| `passwordHash`   | string | Sí        | Contraseña hasheada                                              |
| `nombreRol`      | string | Sí        | Rol asignado                                                     |

> ⚠️ **Cambio:** antes aceptaba `personaId` (número); ahora acepta `identificacion` (string).

---

### Roles

#### `GET /api/roles?nombreUsuario={nombreUsuario}` 🔒

Lista todos los roles disponibles.

---

#### `POST /api/roles` 🔒

Registra un nuevo rol.

**Body:**

```json
{
  "nombreUsuario": "admin",
  "nombre": "Vendedor",
  "accesos": "ventas,inventario"
}
```

| Campo           | Tipo   | Requerido | Descripción                                  |
| --------------- | ------ | --------- | -------------------------------------------- |
| `nombreUsuario` | string | Sí        | Usuario que ejecuta la acción                |
| `nombre`        | string | Sí        | Nombre del rol                               |
| `accesos`       | string | Sí        | Permisos del rol (ej: `"ventas,inventario"`) |

---

#### `PUT /api/roles` 🔒

Modifica un rol existente.

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

#### `GET /api/tipos-productos?nombreUsuario={nombreUsuario}` — público

Lista todos los tipos de producto.

---

#### `POST /api/tipos-productos` 🔒

**Body:**

```json
{ "nombreUsuario": "admin", "nombre": "Electrónico" }
```

---

#### `PUT /api/tipos-productos` 🔒

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

#### `GET /api/marcas-productos?nombreUsuario={nombreUsuario}` — público

Lista todas las marcas de producto.

---

#### `POST /api/marcas-productos` 🔒

**Body:**

```json
{ "nombreUsuario": "admin", "nombre": "Samsung" }
```

---

#### `PUT /api/marcas-productos` 🔒

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

#### `GET /api/ubicaciones?nombreUsuario={nombreUsuario}` 🔒

Lista todas las ubicaciones de almacén.

---

#### `POST /api/ubicaciones` 🔒

**Body:**

```json
{ "nombreUsuario": "admin", "nombre": "Bodega A" }
```

---

#### `PUT /api/ubicaciones` 🔒

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

#### `GET /api/tipos-personas?nombreUsuario={nombreUsuario}` 🔒

Lista todos los tipos de persona.

---

#### `POST /api/tipos-personas` 🔒

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
| `descuentoPct` | decimal | Porcentaje de descuento (0–100) |
| `montoMeta`    | decimal | Monto de compra objetivo        |

---

#### `PUT /api/tipos-personas` 🔒

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

| Campo               | Requerido | Descripción                   |
| ------------------- | --------- | ----------------------------- |
| `nombre`            | Sí        | Nombre actual (identificador) |
| `nuevoNombre`       | No        | Nuevo nombre                  |
| `nuevoDescuentoPct` | No        | Nuevo porcentaje de descuento |
| `nuevoMontoMeta`    | No        | Nuevo monto objetivo          |
| `nuevoEstado`       | No        | Estado activo/inactivo        |

---

### Personas

#### `GET /api/personas?nombreUsuario={u}&rolFiltro={r}&tipoPersonaFiltro={t}&busqueda={b}` 🔒

Consulta personas con filtros opcionales.

| Param               | Tipo   | Requerido | Descripción                                                                |
| ------------------- | ------ | --------- | -------------------------------------------------------------------------- |
| `nombreUsuario`     | string | Sí        | Usuario que consulta                                                       |
| `rolFiltro`         | string | No        | Filtra por rol: `Administradores`, `Vendedores`, `Clientes`, `Proveedores` |
| `tipoPersonaFiltro` | string | No        | Nombre exacto del tipo de persona                                          |
| `busqueda`          | string | No        | Búsqueda parcial por nombre, identificación, correo, teléfono o usuario    |

> ⚠️ **Cambio:** antes tenía un solo param `filtro` con valor por defecto `"TODOS"`; ahora son `rolFiltro` y `tipoPersonaFiltro` separados.

---

#### `POST /api/usuarios` — público

Registra un nuevo usuario del sistema. Internamente crea la persona y luego sus credenciales de login en dos pasos.

**Body:**

```json
{
  "nombreUsuario": "admin",
  "identificacion": "1-1234-5678",
  "nombreCompleto": "Juan Pérez",
  "telefono": "8888-8888",
  "correo": "juan@ejemplo.com",
  "direccion": "San José, Costa Rica",
  "tipoPersona": "Vendedor",
  "newUser": "jperez",
  "passwordHash": "hash_de_la_contraseña",
  "nombreRol": "Vendedor",
  "esProveedor": false
}
```

| Campo            | Tipo    | Requerido | Descripción                                                       |
| ---------------- | ------- | --------- | ----------------------------------------------------------------- |
| `nombreUsuario`  | string  | No        | Admin responsable (`null` = auto-registro de cliente)             |
| `identificacion` | string  | Sí        | Cédula u identificación (mín. 9 caracteres)                       |
| `nombreCompleto` | string  | Sí        | Nombre completo                                                   |
| `telefono`       | string  | No        | Teléfono                                                          |
| `correo`         | string  | No        | Correo electrónico                                                |
| `direccion`      | string  | No        | Dirección                                                         |
| `tipoPersona`    | string  | No        | Tipo de persona (requerido cuando lo registra un admin)           |
| `newUser`        | string  | Sí        | Username de login                                                 |
| `passwordHash`   | string  | Sí        | Contraseña hasheada                                               |
| `nombreRol`      | string  | Sí        | Rol asignado                                                      |
| `esProveedor`    | boolean | No        | `true` si también se registra como proveedor; por defecto `false` |

> ⚠️ **Cambio:** antes usaba un SP único; ahora ejecuta dos llamadas internas (crear persona + crear credenciales). Se agregó campo opcional `tipoPersona`.

---

#### `PUT /api/personas` 🔒

Modifica datos de una persona existente.

**Body:**

```json
{
  "nombreUsuario": "admin",
  "identificacion": "1-1234-5678",
  "nuevoNombre": "Juan A. Pérez",
  "nuevoTelefono": "7777-7777",
  "nuevoCorreo": "juanperez@ejemplo.com",
  "nuevaDireccion": "Heredia, Costa Rica",
  "nuevoTipoPersona": "VIP",
  "nuevoEstado": true
}
```

| Campo              | Requerido | Descripción                                             |
| ------------------ | --------- | ------------------------------------------------------- |
| `identificacion`   | Sí        | Identificación de la persona (usado para ubicarla)      |
| `nuevoNombre`      | No        | Nuevo nombre completo                                   |
| `nuevoTelefono`    | No        | `""` para borrar el teléfono, `null` para no modificar  |
| `nuevoCorreo`      | No        | `""` para borrar el correo, `null` para no modificar    |
| `nuevaDireccion`   | No        | `""` para borrar la dirección, `null` para no modificar |
| `nuevoTipoPersona` | No        | Solo puede modificarlo un Administrador                 |
| `nuevoEstado`      | No        | Solo puede modificarlo un Administrador                 |

> ⚠️ **Cambio:** antes se identificaba la persona por `personaId` (número) y aceptaba `nuevaIdentificacion`, `nuevoNombreCompleto`; ahora se identifica por `identificacion` (string), `nuevoNombreCompleto` → `nuevoNombre`, `nuevaIdentificacion` eliminado, se agregó `nuevoTipoPersona`.

---

### Proveedores

#### `GET /api/proveedores?nombreUsuario={u}&busqueda={b}` 🔒

Retorna el detalle completo de todos los proveedores (nombre, identificación, contacto, estado, etc.).

| Param           | Tipo   | Requerido | Descripción                                                    |
| --------------- | ------ | --------- | -------------------------------------------------------------- |
| `nombreUsuario` | string | Sí        | Usuario que consulta (debe ser Administrador)                  |
| `busqueda`      | string | No        | Búsqueda parcial por nombre, identificación, correo o teléfono |

> Este endpoint es el que debe usarse para el CRUD de proveedores en el frontend, ya que incluye la `identificación` necesaria para operaciones de edición.

---

#### `GET /api/proveedores/nombres?nombreUsuario={nombreUsuario}` 🔒

Retorna únicamente los nombres de los proveedores. Ideal para dropdowns/selects.

| Param           | Tipo   | Descripción                                              |
| --------------- | ------ | -------------------------------------------------------- |
| `nombreUsuario` | string | Usuario que realiza la consulta (debe ser Administrador) |

---

#### `POST /api/proveedores` 🔒

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

#### `PUT /api/proveedores` 🔒

Modifica un proveedor existente.

**Body:**

```json
{
  "nombreUsuario": "admin",
  "identificacion": "3-101-123456",
  "nuevoNombre": "Distribuidora XYZ Internacional",
  "nuevoTelefono": "2233-2233",
  "nuevoCorreo": "ventas@xyz.com",
  "nuevaDireccion": "Cartago, Costa Rica",
  "nuevoEstado": true
}
```

| Campo            | Requerido | Descripción                                        |
| ---------------- | --------- | -------------------------------------------------- |
| `identificacion` | Sí        | Identificación del proveedor (usado para ubicarlo) |
| `nuevoNombre`    | No        | Nuevo nombre completo                              |
| `nuevoTelefono`  | No        | `""` para borrar, `null` para no modificar         |
| `nuevoCorreo`    | No        | `""` para borrar, `null` para no modificar         |
| `nuevaDireccion` | No        | `""` para borrar, `null` para no modificar         |
| `nuevoEstado`    | No        | Estado activo/inactivo                             |

> ⚠️ **Cambio:** antes se identificaba el proveedor por `proveedorId` (número) y aceptaba `nuevaIdentificacion`, `nuevoNombreCompleto`; ahora se identifica por `identificacion` (string), `nuevoNombreCompleto` → `nuevoNombre`, `nuevaIdentificacion` y `proveedorId` eliminados.

---

### Categorías de Descuento

#### `GET /api/cat-descuentos?nombreUsuario={nombreUsuario}` 🔒

Lista todas las categorías de descuento.

---

#### `POST /api/cat-descuentos` 🔒

**Body:**

```json
{ "nombreUsuario": "admin", "nombre": "Descuento Navideño" }
```

---

#### `PUT /api/cat-descuentos` 🔒

**Body:**

```json
{
  "nombreUsuario": "admin",
  "nombre": "Descuento Navideño",
  "nuevoNombre": "Descuento Fin de Año",
  "nuevoEstado": true
}
```

---

### Estados de Entrega

#### `GET /api/estados-entregas?nombreUsuario={nombreUsuario}` 🔒

Lista todos los estados de entrega.

---

#### `POST /api/estados-entregas` 🔒

**Body:**

```json
{ "nombreUsuario": "admin", "nombre": "En camino" }
```

---

#### `PUT /api/estados-entregas` 🔒

**Body:**

```json
{
  "nombreUsuario": "admin",
  "nombre": "En camino",
  "nuevoNombre": "En tránsito",
  "nuevoEstado": true
}
```

---

### Descuentos

#### `GET /api/descuentos?nombreUsuario={u}&categoriaFiltro={c}&fechaDesde={d}&fechaHasta={h}` 🔒

Consulta descuentos con filtros opcionales.

| Param             | Tipo   | Requerido | Descripción                            |
| ----------------- | ------ | --------- | -------------------------------------- |
| `nombreUsuario`   | string | Sí        | Usuario que consulta                   |
| `categoriaFiltro` | string | No        | Nombre exacto de la categoría          |
| `fechaDesde`      | date   | No        | Rango de inicio (formato `YYYY-MM-DD`) |
| `fechaHasta`      | date   | No        | Rango de fin (formato `YYYY-MM-DD`)    |

---

#### `POST /api/descuentos` 🔒

Registra un nuevo descuento.

**Body:**

```json
{
  "nombreUsuario": "admin",
  "nombreComercial": "Black Friday 2026",
  "descripcion": "Descuento especial de fin de año",
  "categoria": "Descuento Fin de Año",
  "porcentaje": 25.0,
  "fechaInicio": "2026-11-27",
  "fechaFinal": "2026-11-30"
}
```

| Campo             | Tipo    | Requerido | Descripción                                               |
| ----------------- | ------- | --------- | --------------------------------------------------------- |
| `nombreUsuario`   | string  | Sí        | Usuario que ejecuta la acción                             |
| `nombreComercial` | string  | Sí        | Nombre del descuento                                      |
| `descripcion`     | string  | Sí        | Descripción del descuento                                 |
| `categoria`       | string  | Sí        | Nombre de la categoría (debe existir en `cat-descuentos`) |
| `porcentaje`      | decimal | Sí        | Porcentaje de descuento (ej: `25.00`)                     |
| `fechaInicio`     | date    | Sí        | Fecha de inicio (`YYYY-MM-DD`)                            |
| `fechaFinal`      | date    | Sí        | Fecha de finalización (`YYYY-MM-DD`)                      |

---

#### `PUT /api/descuentos` 🔒

Modifica un descuento existente.

**Body:**

```json
{
  "nombreUsuario": "admin",
  "nombreComercial": "Black Friday 2026",
  "nuevoNombreComercial": "Black Friday Extended",
  "nuevaDescripcion": null,
  "nuevaCategoria": null,
  "nuevoPorcentaje": 30.0,
  "nuevaFechaInicio": null,
  "nuevaFechaFin": "2026-12-02",
  "nuevoEstado": true
}
```

| Campo             | Requerido | Descripción                                         |
| ----------------- | --------- | --------------------------------------------------- |
| `nombreComercial` | Sí        | Nombre actual del descuento (identificador)         |
| demás campos      | No        | Solo enviar los que cambian (`null` = no modificar) |

---

### Productos

#### `GET /api/productos?nombreUsuario={u}&filtroDescripcion={d}&filtroTipo={t}&filtroMarca={m}&filtroProveedor={p}&filtroDescuento={dc}` 🔒

Consulta productos con filtros opcionales.

| Param               | Tipo   | Requerido | Descripción                          |
| ------------------- | ------ | --------- | ------------------------------------ |
| `nombreUsuario`     | string | Sí        | Usuario que consulta                 |
| `filtroDescripcion` | string | No        | Búsqueda parcial en descripción      |
| `filtroTipo`        | string | No        | Nombre exacto del tipo de producto   |
| `filtroMarca`       | string | No        | Nombre exacto de la marca            |
| `filtroProveedor`   | string | No        | Nombre exacto del proveedor          |
| `filtroDescuento`   | string | No        | Nombre exacto del descuento aplicado |

---

#### `POST /api/productos` 🔒

Registra un nuevo producto e ingresa stock al inventario.

**Body:**

```json
{
  "nombreUsuario": "admin",
  "rutaImagen": "/images/productos/laptop-hp.jpg",
  "descripcion": "Laptop HP 15 pulgadas",
  "tipoProducto": "Computadoras",
  "marcaProducto": "HP",
  "nombreProveedor": "Distribuidora XYZ S.A.",
  "precioCompra": 350000.0,
  "precioVenta": 499000.0,
  "nombreUbicacion": "Bodega A",
  "cantidadIngreso": 10,
  "stockMinimo": 2,
  "nombreDescuento": null
}
```

| Campo             | Tipo    | Requerido | Descripción                                                          |
| ----------------- | ------- | --------- | -------------------------------------------------------------------- |
| `nombreUsuario`   | string  | Sí        | Usuario que ejecuta la acción                                        |
| `rutaImagen`      | string  | Sí        | Ruta o URL de la imagen del producto                                 |
| `descripcion`     | string  | Sí        | Descripción del producto                                             |
| `tipoProducto`    | string  | Sí        | Nombre exacto del tipo (debe existir en `tipos-productos`)           |
| `marcaProducto`   | string  | Sí        | Nombre exacto de la marca (debe existir en `marcas-productos`)       |
| `nombreProveedor` | string  | Sí        | Nombre completo del proveedor (debe existir en `proveedores`)        |
| `precioCompra`    | decimal | Sí        | Precio de compra                                                     |
| `precioVenta`     | decimal | Sí        | Precio de venta al público                                           |
| `nombreUbicacion` | string  | Sí        | Nombre de la ubicación de inventario (debe existir en `ubicaciones`) |
| `cantidadIngreso` | int     | Sí        | Cantidad a ingresar al inventario                                    |
| `stockMinimo`     | int     | Sí        | Stock mínimo (solo aplica si es la primera vez en esa ubicación)     |
| `nombreDescuento` | string  | No        | Nombre del descuento a aplicar (`null` = sin descuento)              |

---

### Auditorías

#### `GET /api/auditorias?nombreUsuario={u}&fechaFiltro={f}&tablaFiltro={t}` 🔒

Consulta el registro de auditoría.

| Param           | Tipo     | Requerido | Descripción                                              |
| --------------- | -------- | --------- | -------------------------------------------------------- |
| `nombreUsuario` | string   | Sí        | Usuario que consulta                                     |
| `fechaFiltro`   | datetime | No        | Filtrar por fecha (ISO 8601: `2026-04-02T00:00:00`)      |
| `tablaFiltro`   | string   | No        | Filtrar por tabla afectada (ej: `"ROLES"`, `"PERSONAS"`) |

---

#### `POST /api/auditorias` 🔒

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

| Campo           | Tipo   | Requerido | Descripción                                                         |
| --------------- | ------ | --------- | ------------------------------------------------------------------- |
| `personaId`     | number | Sí        | ID del usuario que realizó la acción                                |
| `accion`        | string | Sí        | `"SELECT"`, `"INSERT"`, `"UPDATE"` o `"DELETE"`                     |
| `tablaAfectada` | string | Sí        | Nombre de la tabla afectada                                         |
| `filaAfectada`  | number | Sí        | ID del registro afectado (`0` para SELECT)                          |
| `descripcion`   | string | Sí        | Descripción legible (mín. 11 caracteres)                            |
| `antes`         | string | No        | JSON stringify del estado anterior (requerido para UPDATE y DELETE) |
| `despues`       | string | No        | JSON stringify del estado nuevo (requerido para INSERT y UPDATE)    |

//1. Health — GET /api/health  
 //2. Sesiones — POST /verificar (login) + POST /api/sesiones (crear cuenta)  
 //3. Roles — GET + POST + PUT /api/roles  
 //4. Tipos de Producto — GET + POST + PUT /api/tipos-productos  
 //5. Marcas de Producto — GET + POST + PUT /api/marcas-productos  
 //6. Ubicaciones — GET + POST + PUT /api/ubicaciones  
 7. Tipos de Persona — GET + POST + PUT /api/tipos-personas  
 8. Personas — GET /api/personas + PUT /api/personas  
 9. Usuarios — POST /api/usuarios (registro)
//10. Proveedores — GET /api/proveedores + GET /nombres + POST + PUT  
 //11. Categorías Descuento — GET + POST + PUT /api/cat-descuentos  
 //12. Estados de Entrega — GET + POST + PUT /api/estados-entregas  
 13. Descuentos — GET + POST + PUT /api/descuentos ← NUEVO  
 14. Productos — GET + POST /api/productos ← NUEVO  
 15. Auditorías — GET + POST /api/auditorias
