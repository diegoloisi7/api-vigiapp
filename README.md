# VigiAPP API

API REST del MVP, construida con NestJS, TypeORM y MariaDB 10.4 o superior. TypeORM usa `synchronize: false` y no modifica las tablas automáticamente. El DDL estructural se mantiene fuera de este repositorio.

## Inicio local

1. Usar Node.js 20 o superior e instalar dependencias con `npm install`.
2. Copiar `.env.example` a `.env` y configurar `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` y `DB_DATABASE` para la instancia local.
3. Aplicar el DDL estructural de VigiAPP a una base nueva desde un cliente SQL. El archivo crea y selecciona la base `vigiapp`. La API escribe sus marcas de tiempo en UTC; si otros clientes escriben directamente en las tablas, configurar sus sesiones MariaDB en UTC.
4. Ejecutar `npm run start:dev` y abrir `http://127.0.0.1:3000/api/health`. Esa ruta ejecuta `SELECT 1` para comprobar la conexión a MariaDB.

Como alternativa, `docker compose up -d mariadb` levanta MariaDB local. Después hay que aplicar el DDL manualmente; Docker Compose no importa el esquema. Para Docker, usar los valores de `.env.example` o configurar `DB_PASSWORD` tanto para Compose como para la API.

## Swagger local

Con la API iniciada, abrir `http://127.0.0.1:3000/api/docs` para ver y ejecutar los endpoints actuales. La especificación OpenAPI está disponible en `http://127.0.0.1:3000/api/docs-json`. Si se cambia `PORT` o `API_PREFIX`, ajustar la URL.

No hace falta iniciar sesión. Primero registrar un usuario con `POST /api/users`; luego las rutas que necesitan un usuario usan por defecto el primero registrado. Para probar con otro, completar el encabezado opcional `X-Test-User-Id` en Swagger con su ID.

## Endpoints

Todos usan el prefijo `/api`. Los IDs de la base son `BIGINT` y viajan como cadenas en JSON para evitar pérdida de precisión en JavaScript.

| Recurso          | Rutas                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| Usuarios         | `POST /users`, `GET /users/me`, `GET /users`, `GET /users/:id`, `PATCH /users/:id`, `DELETE /users/:id`             |
| Grupos vecinales | `POST /groups`, `GET /groups`, `GET /groups/:id`, `PATCH /groups/:id`, `DELETE /groups/:id`                          |
| Membresías       | `POST /memberships`, `GET /memberships`, `GET /memberships/:id`, `DELETE /memberships/:id`                             |
| Categorías       | `POST /categories`, `GET /categories`, `GET /categories/:id`, `PATCH /categories/:id`, `DELETE /categories/:id`      |
| Incidentes       | `POST /incidents`, `GET /incidents`, `GET /incidents/:id`, `PATCH /incidents/:id`, `DELETE /incidents/:id`           |

`GET /incidents?groupId=1&active=true` devuelve los incidentes activos, no eliminados y no vencidos de un grupo, listos para el mapa. Las coordenadas de un incidente nuevo o reubicado deben quedar dentro del círculo definido por el centro y radio de su grupo; si quedan afuera, la API responde `400`. `DELETE /incidents/:id` hace borrado lógico. El resto de los `DELETE` son físicos y la base puede impedirlos si existen relaciones. En los reportes anónimos, `createdByUserId` solo se muestra al autor, al creador del grupo y al administrador global. El registro de prueba no pide contraseña: se genera un hash aleatorio para completar `password_hash` en la base. Nunca se devuelve ese hash ni el domicilio o las coordenadas del hogar.

Ejemplo de incidente con IDs existentes:

```json
{
  "groupId": "1",
  "categoryId": "1",
  "reportType": "STANDARD",
  "title": "Farola apagada",
  "description": "La farola de la esquina no enciende",
  "latitude": -34.603722,
  "longitude": -58.381592,
  "locationSource": "MANUAL",
  "isAnonymous": false,
  "expiresAt": "2030-12-31T23:59:59.000Z"
}
```

Enviar ese JSON con `POST /api/incidents`. El usuario de prueba queda registrado como autor; no se acepta `createdByUserId` del cliente. Los IDs referenciados deben existir. Las validaciones HTTP y las claves foráneas del DDL rechazan datos inválidos.

## Identidad de prueba y permisos

El registro se realiza con `POST /api/users` y queda con rol global `USER`. Durante estas pruebas, la API no ofrece `POST /api/auth/login` ni exige JWT. Las rutas que necesitan identidad toman el primer usuario registrado o el ID indicado en `X-Test-User-Id`; el encabezado no es una credencial y cualquiera con acceso local puede elegir cualquier usuario existente. `GET /api/users/me` devuelve el perfil de ese usuario. La API solo inicia si `HOST` es `127.0.0.1`, `localhost` o `::1`.

Los roles globales (`users.app_role`) son `USER` y `ADMIN`. El rol `ADMIN` puede consultar usuarios y todos los incidentes y membresías, administrar categorías, grupos y vecinos. Los usuarios solo pueden consultar y modificar su perfil.

Los roles de grupo (`group_memberships.group_role`) son `GROUP_ADMIN` y `NEIGHBOR`. Al crear un grupo, el creador recibe la membresía `GROUP_ADMIN` en la misma transacción. Solo el creador puede ejercer permisos de `GROUP_ADMIN` en ese grupo: modificarlo, agregar o quitar vecinos y moderar incidentes. Las nuevas membresías reciben `NEIGHBOR`; no se permite cambiar el rol por API ni quitar la membresía del creador mientras exista el grupo. Cada usuario puede pertenecer a un solo grupo. Un `NEIGHBOR` puede ver y crear incidentes de su grupo, editar o eliminar los propios y abandonar su membresía. Incluso un `ADMIN` global debe ser miembro para crear un incidente en un grupo.

El alta directa de membresías queda restringida al `ADMIN` global o al creador del grupo. El flujo de invitaciones (`group_invitations`) todavía no está implementado. Al eliminar un grupo, la API elimina sus membresías en la misma transacción; otras relaciones del DDL pueden impedir la baja y causar rollback.

El primer `ADMIN` se asigna manualmente en la base de desarrollo, por ejemplo: `UPDATE users SET app_role = 'ADMIN' WHERE id = '1';`. No se permite asignar ese rol mediante el endpoint de registro o actualización de perfil.

## Logs HTTP

La consola registra cada solicitud con método, endpoint, parámetros de consulta, código HTTP, duración, body recibido y resultado. Los errores incluyen la respuesta de error. Los logs ocultan contraseñas, correo, DNI, nombres, domicilio, coordenadas del hogar y tokens; los registros largos se truncan. Los errores 4xx salen como `WARN` y los 5xx como `ERROR`.

## Alcance actual

La API escucha en `127.0.0.1` por defecto. La autenticación está deshabilitada solo para pruebas locales; los controles de rol y pertenencia a grupos siguen activos para el usuario de prueba seleccionado. Las tablas `group_invitations`, `incident_confirmations`, `incident_media`, `important_notices`, `notifications`, `notification_preferences` y `contact_submissions` todavía no tienen endpoints. `push_subscriptions` es una tabla heredada del DDL v2 y no se usa en el MVP actual.
