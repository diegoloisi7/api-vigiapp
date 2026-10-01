# VigiAPP API

API REST inicial para VigiAPP, construida con NestJS, TypeScript y PostgreSQL.

## Requisitos

- Node.js 20 o superior
- npm
- Docker Compose (para ejecutar PostgreSQL localmente)

## Inicio local

1. Instalar dependencias: `npm install`.
2. Copiar `.env.example` a `.env`.
3. Iniciar PostgreSQL: `docker compose up -d postgres`.
4. Iniciar la API: `npm run start:dev`.
5. Consultar `http://localhost:3000/api/health`.

La configuración de TypeORM usa `synchronize: false`. Las entidades y migraciones se incorporarán al definir el modelo de datos; así evitamos que el ORM altere el esquema automáticamente.

## Organización

Los módulos de NestJS agrupan endpoints, lógica de aplicación y acceso a datos por funcionalidad. Los DTOs validan la entrada HTTP y las entidades TypeORM representan el esquema persistido.

```text
src/
  app.module.ts
  main.ts
  health/
    health.controller.ts
    health.module.ts
```

Al cerrar el alcance se pueden agregar módulos como `users` e `incidents` sin cambiar el arranque de la aplicación. REST y PostgreSQL son la primera etapa; WebSockets y notificaciones quedan para después del circuito funcional de incidentes.

## Configuración

Las variables disponibles están documentadas en `.env.example`. No se deben guardar credenciales reales en el repositorio.
