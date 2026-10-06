// Regeneración bajo demanda (ISR): el pipeline de publicación la llama al aprobar una noticia,
// para que la portada y /noticias se actualicen al instante en vez de esperar a un visitante.
// POST /api/revalidate  { "slug": "mi-noticia" }   cabecera: x-revalidate-secret: <REVALIDATE_SECRET>

const SLUG_VALIDO = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const rutasParaRevalidar = (slug) =>
    ['/', '/noticias', ...(slug ? [`/noticias/${slug}`] : [])]

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST')
        return res.status(405).json({ error: 'Método no permitido' })
    }

    const secreto = process.env.REVALIDATE_SECRET
    if (!secreto || req.headers['x-revalidate-secret'] !== secreto) {
        return res.status(401).json({ error: 'No autorizado' })
    }

    const slug = req.body?.slug
    if (slug !== undefined && (typeof slug !== 'string' || !SLUG_VALIDO.test(slug))) {
        return res.status(400).json({ error: 'Slug inválido' })
    }

    const rutas = rutasParaRevalidar(slug)
    try {
        await Promise.all(rutas.map((ruta) => res.revalidate(ruta)))
        return res.status(200).json({ revalidadas: rutas })
    } catch (error) {
        console.error(`[revalidate] ${error.message}`)
        return res.status(500).json({ error: 'No se pudo regenerar' })
    }
}
