# VigiAPP API

Backend NestJS, TypeORM y MariaDB para la web local de VigiAPP. Las rutas usan el prefijo `/api` y nombres compatibles con el cliente React. La API aplica permisos de usuario y de grupo. El contrato React usa IDs numéricos; para la demo local se presupone que no superan `Number.MAX_SAFE_INTEGER`.

## Preparación local

1. Instalar dependencias con `npm install`.
2. Copiar `.env.example` a `.env` y configurar el usuario y contraseña reales de MariaDB, la base `vigiapp` y un `JWT_SECRET` aleatorio. El backend solo escucha en localhost.
3. **Base nueva:** importar [`schema/vigiapp_mvp_v3_01_estructura_es.sql`](schema/vigiapp_mvp_v3_01_estructura_es.sql). Este archivo crea y selecciona la base `vigiapp`. Para preservar una `vigiapp` v2 existente, cambiar las sentencias `CREATE DATABASE` y `USE` del DDL a otro nombre, por ejemplo `vigiapp_v3`, y configurar `DB_DATABASE` con ese nombre. **Base v2 con datos:** conservarla como está y hacer una copia de seguridad antes de una eventual migración; no importar el DDL v3 encima.
4. Ejecutar `npm run migration:run`. La primera migración renombra las tablas y columnas de v2 a v3 según el [diccionario](schema/VIGIAPP_DICCIONARIO_BD_ES.md), o no hace cambios si la base ya es v3.01. La segunda aplica [`migrations/20261025_front_contract.sql`](migrations/20261025_front_contract.sql), que agrega las columnas y dos tablas necesarias para el frontend. TypeORM registra ambas migraciones. `synchronize` permanece en `false`.
5. Ejecutar `npm run start:dev`. Comprobar `http://localhost:3000/api/health` y revisar `http://localhost:3000/api/docs`.

Las invitaciones se guardan en `invitaciones_grupo` y el destinatario las consulta al entrar en la aplicación; no se envía correo.

## Contrato HTTP

| Área | Rutas principales |
|---|---|
| Identidad | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `PATCH /auth/password`, `POST /auth/logout` |
| Grupos | `POST /grupos`, `GET /grupos/mios`, `GET /grupos/:id` |
| Invitaciones | `POST /grupos/:id/invitaciones`, `DELETE /grupos/:id/invitaciones/:invId`, `GET /invitaciones/mias`, `POST /invitaciones/:id/respuesta` |
| Incidentes | `GET /incidencias`, `GET /incidencias/mias`, `GET /incidencias/:id`, `POST /incidencias`, `POST /incidencias/urgentes`, `PATCH /incidencias/:id`, `PATCH /incidencias/:id/estado`, `POST` y `DELETE /incidencias/:id/confirmaciones`, `POST /incidencias/:id/ya-resuelto` |
| Avisos | `GET /avisos`, `GET /avisos/mios`, `POST /avisos`, `PATCH /avisos/:id`, `POST /avisos/:id/cierre` |
| Otros | `GET /categorias`, `POST /contactos`, `GET /notificaciones`, `PATCH /notificaciones/:id/leida` |
| Administración | `GET /admin/estadisticas`; CRUD de grupos y usuarios; borrado de incidentes y avisos; alta/edición de categorías; listado y lectura de contactos |

El login devuelve un JWT y coloca una cookie HTTP-only para cargar fotos protegidas desde `<img>`. Las solicitudes JSON pueden enviar `Authorization: Bearer …`. `POST /incidencias` acepta JSON o multipart con el archivo `foto` (JPG, PNG, WebP o GIF, máximo 5 MB). El frontend debe enviar `lat` y `lng`; también son obligatorios para el SOS. Las coordenadas se validan contra el círculo del grupo antes de insertar.

Socket.IO recibe el JWT en `auth.token`, verifica al usuario y lo incorpora a las salas de sus grupos. Después del commit de un urgente, el backend emite `incident:urgent` con `groupId`, `incidentId` y un mensaje. El cliente vuelve a consultar incidentes y notificaciones al conectarse o recibir el evento. Las alertas solo llegan mientras la web está abierta.

## Estado de la verificación

`npm run test:contract` compila y comprueba el orden de persistencia y emisión del SOS, el rechazo fuera del círculo y la correspondencia de las 15 entidades con el DDL v3.01 y su complemento. El renombrado v2 → v3.01 se ensayó además en bases temporales MariaDB 10.4 con datos sintéticos y con una copia de los datos locales; el script [`test/migration-db-smoke.cjs`](test/migration-db-smoke.cjs) no modifica la base fuente. `npm run build` y ESLint también verifican el código. Los estados y plazos de vencimiento implementados a partir del frontend son provisionales hasta que el equipo cierre esas reglas.
