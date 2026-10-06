import axios from 'axios'

export const getApiUrl = () => process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || ''

// Devuelve [] si la API falla, para que las páginas no se caigan.
export async function fetchList(recurso) {
    try {
        const { data } = await axios.get(`${getApiUrl()}/${recurso}`)
        return Array.isArray(data) ? data : []
    } catch (error) {
        console.error(`[api] No se pudo cargar "${recurso}": ${error.message}`)
        return []
    }
}

// Devuelve el primer elemento que coincide con el slug, o null.
export async function fetchBySlug(recurso, slug) {
    try {
        const { data } = await axios.get(`${getApiUrl()}/${recurso}`, { params: { slug } })
        return Array.isArray(data) && data.length ? data[0] : null
    } catch (error) {
        console.error(`[api] No se pudo cargar "${recurso}/${slug}": ${error.message}`)
        return null
    }
}
