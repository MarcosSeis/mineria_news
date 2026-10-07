# Minería News

Portal de noticias, eventos, bolsa de trabajo y proveedores del sector minero. Next.js (Pages Router) + API REST de WordPress.

## Requisitos
- Node.js 20.9 o superior

## Puesta en marcha
```bash
cp .env.example .env.local   # ajusta API_URL si hace falta
npm install
npm run dev                  # http://localhost:3000
```

## Scripts
| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Build y servidor de producción |
| `npm run lint` | ESLint |
| `npm test` | Pruebas unitarias (Jest + Testing Library) |
| `npm run test:coverage` | Pruebas con reporte de cobertura |

## Variables de entorno
- `API_URL`: URL base de la API REST de WordPress (`NEXT_PUBLIC_API_URL` se acepta como respaldo).
- `REVALIDATE_SECRET`: secreto de `POST /api/revalidate`, que regenera al instante la portada, `/noticias` y la nota recién publicada. Sin él, la ruta responde 401 y el sitio se actualiza solo por ISR (el primer visitante ve la versión anterior).

## Directorio de minas
`/minas` y `/minas/[url]` leen el tipo de contenido `mina` de WordPress (`/wp-json/wp/v2/mina`). Campos ACF (todos texto, con "Mostrar en REST API" activo): `titulo` (obligatorio), `estado`, `empresa`, `minerales` (separados por coma), `tipo`, `estatus`, `descripcion`, `imagen` (URL de `minasapi.space`), `sitio_web`. Sin minas cargadas la página muestra un mensaje vacío.

## Estructura
- `pages/`: rutas. Las listas usan ISR; los detalles se generan bajo demanda (`fallback: 'blocking'`).
- `components/`, `styles/`: UI y CSS Modules.
- `hooks/useActualizacionAutomatica.js`: la portada y `/noticias` se refrescan solas cada 60 s (y al volver a la pestaña) sin recargar la página.
- `lib/api.js`: cliente de la API; devuelve `[]`/`null` si la API falla, así que las páginas no se caen.
- `utils/helpers.js`: fechas (`YYYYMMDD`, `YYYY-MM-DD`, `MM/DD/YYYY`), filtros y validación de URLs.
- `__tests__/`, `test-utils/`: pruebas y datos de ejemplo.

## Notas
- El boletín (Mailchimp) está desactivado por ahora; se retiró del código.
- La bolsa de trabajo muestra solo ofertas de los últimos 28 días.
