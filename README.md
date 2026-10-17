# VigiAPP API

API REST del MVP, construida con NestJS, TypeORM y MariaDB 10.4 o superior. TypeORM usa `synchronize: false` y no modifica las tablas automáticamente. El DDL estructural se mantiene fuera de este repositorio.

## Inicio local

1. Usar Node.js 20 o superior e instalar dependencias con `npm install`.
2. Copiar `.env.example` a `.env` y configurar `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` y `DB_DATABASE` para la instancia local.
3. Aplicar el DDL estructural de VigiAPP a una base nueva desde un cliente SQL. El archivo crea y selecciona la base `vigiapp`. La API escribe sus marcas de tiempo en UTC; si otros clientes escriben directamente en las tablas, configurar sus sesiones MariaDB en UTC.
4. Ejecutar `npm run start:dev` y abrir `http://127.0.0.1:3000/api/health`. Esa ruta ejecuta `SELECT 1` para comprobar la conexión a MariaDB.

Como alternativa, `docker compose up -d mariadb` levanta MariaDB local. Después hay que aplicar el DDL manualmente; Docker Compose no importa el esquema. Para Docker, usar los valores de `.env.example` o configurar `DB_PASSWORD` tanto para Compose como para la API.

## Endpoints

Todos usan el prefijo `/api`. Los IDs de la base son `BIGINT` y viajan como cadenas en JSON para evitar pérdida de precisión en JavaScript.

| Recurso          | Rutas                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| Usuarios         | `POST /users`, `GET /users`, `GET /users/:id`, `PATCH /users/:id`, `DELETE /users/:id`                               |
| Grupos vecinales | `POST /groups`, `GET /groups`, `GET /groups/:id`, `PATCH /groups/:id`, `DELETE /groups/:id`                          |
| Membresías       | `POST /memberships`, `GET /memberships`, `GET /memberships/:id`, `PATCH /memberships/:id`, `DELETE /memberships/:id` |
| Categorías       | `POST /categories`, `GET /categories`, `GET /categories/:id`, `PATCH /categories/:id`, `DELETE /categories/:id`      |
| Incidentes       | `POST /incidents`, `GET /incidents`, `GET /incidents/:id`, `PATCH /incidents/:id`, `DELETE /incidents/:id`           |

`GET /incidents?groupId=1&active=true` devuelve los incidentes activos, no eliminados y no vencidos de un grupo, listos para el mapa. `DELETE /incidents/:id` hace borrado lógico. El resto de los `DELETE` son físicos y la base puede impedirlos si existen relaciones. Los reportes anónimos no incluyen `createdByUserId` en la respuesta. La contraseña de usuario se almacena con bcrypt y nunca se devuelve; tampoco se exponen domicilio ni coordenadas del hogar.

Ejemplo de incidente con IDs existentes:

```json
{
  "groupId": "1",
  "createdByUserId": "1",
  "categoryId": "1",
  "reportType": "STANDARD",
  "title": "Farola apagada",
  "latitude": -34.603722,
  "longitude": -58.381592,
  "locationSource": "MANUAL",
  "isAnonymous": false,
  "expiresAt": "2030-12-31T23:59:59.000Z"
}
```

Enviar ese JSON con `POST /api/incidents`. Los IDs referenciados deben existir. Las validaciones HTTP y las claves foráneas del DDL rechazan datos inválidos.

## Logs HTTP

La consola registra cada solicitud con método, endpoint, parámetros de consulta, código HTTP, duración, body recibido y resultado. Los errores incluyen la respuesta de error. Los logs ocultan contraseñas, correo, DNI, nombres, domicilio, coordenadas del hogar y tokens; los registros largos se truncan. Los errores 4xx salen como `WARN` y los 5xx como `ERROR`.

## Alcance actual

Estos endpoints sirven para desarrollo local. Todavía no hay autenticación ni autorización: cualquier cliente que pueda acceder a la API podría crear, cambiar o borrar recursos. La API escucha en `127.0.0.1` por defecto; no se debe exponer en una red o Internet antes de agregar control de acceso. Las tablas `membership_requests`, `incident_media`, `notifications`, `push_subscriptions` y `notification_preferences` permanecen en el esquema para sus flujos posteriores.
