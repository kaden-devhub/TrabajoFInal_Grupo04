# ComparaSalud – Frontend Angular

Angular 22 + Angular Material (misma base que `appproveedores` y la estructura de `ComparaSalud`).
Incluye solo: barra de navegación por rol, **login** y **registro** conectados al backend con seguridad
(`comparasalud_backend_con_seguridad`). Las demás pantallas son componentes de relleno ("... works!").

## Ejecutar
1. Levantar el backend (`http://localhost:8088`, ya permite CORS desde `http://localhost:4200`).
2. En esta carpeta:
   ```
   npm install
   ng serve        (o npm start)
   ```
3. Abrir http://localhost:4200

La URL del backend está en `src/app/environments/environment.ts` (`apiUrl`).

## Qué hace
- **Login** (`/login`): elige Cliente / Farmacia / Admin y llama a `POST /api/{clientes|farmacias|administradores}/login`.
  Guarda `{rol, id, nombre, token}` en `sessionStorage`; el interceptor envía `Authorization: Bearer <token>`.
- **Registro** (`/registro`): cliente (`POST /api/clientes`) o farmacia (`POST /api/farmacias`); al terminar inicia sesión solo.
  El backend valida y devuelve la lista de errores, que se muestra en el formulario.
- **Barra de navegación**: cambia según el rol. Cerrar sesión borra el token del navegador (el backend no tiene logout).
- **Guard por rol** (`role.guard.ts`): sin sesión va a `/login`; con otro rol va a la pantalla de su propio rol.

## Rutas por rol
| Rol | Rutas |
|---|---|
| Público | `/` · `/login` · `/registro` |
| CLIENTE | `/cliente/buscar` · `/cliente/ofertas` · `/cliente/farmacias` · `/cliente/favoritos` · `/cliente/cuenta` |
| FARMACIA | `/farmacia/ofertas` · `/farmacia/medicamentos` · `/farmacia/perfil` |
| ADMINISTRADOR | `/admin/resumen` · `/admin/categorias` · `/admin/farmacias` · `/admin/clientes` · `/admin/medicamentos` |

Administrador del backend: `admin@comparasalud.com` / `admin123` (se crea al iniciar el backend).
