const MS_POR_DIA = 86400000
const FECHA_REGEX = /^(\d{4})-?(\d{2})-?(\d{2})/
const FECHA_US_REGEX = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/ // MM/DD/YYYY, como la entrega WordPress/ACF

// Acepta 'YYYYMMDD', 'YYYY-MM-DD', 'MM/DD/YYYY', ISO completo o Date. Devuelve Date (UTC) o null.
export const parseFecha = (valor) => {
    if (valor instanceof Date) return isNaN(valor) ? null : valor
    if (valor === null || valor === undefined || valor === '') return null

    const texto = String(valor).trim()
    const match = FECHA_REGEX.exec(texto)
    const us = FECHA_US_REGEX.exec(texto)
    let fecha
    if (match) fecha = new Date(Date.UTC(+match[1], +match[2] - 1, +match[3]))
    else if (us) fecha = new Date(Date.UTC(+us[3], +us[1] - 1, +us[2]))
    else fecha = new Date(texto)

    return isNaN(fecha) ? null : fecha
}

export const formatearFecha = (fecha) => {
    const fechaNueva = parseFecha(fecha)
    if (!fechaNueva) return ''

    return fechaNueva.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        timeZone: 'UTC'
    })
}

export const diasDesde = (fecha, hoy = new Date()) => {
    const publicada = parseFecha(fecha)
    if (!publicada) return null
    return Math.max(0, Math.floor((hoy - publicada) / MS_POR_DIA))
}

export const textoHace = (dias) => {
    if (dias === null || dias === undefined) return ''
    if (dias === 0) return 'Hoy'
    return `Hace ${dias} ${dias === 1 ? 'día' : 'días'}`
}

export const ordenarPorFechaDesc = (items, campo = 'date') =>
    [...items].sort((a, b) => (parseFecha(b[campo])?.getTime() ?? 0) - (parseFecha(a[campo])?.getTime() ?? 0))

export const filtrarRecientes = (jobs, maxDias = 28, hoy = new Date()) =>
    jobs.filter((job) => {
        const dias = diasDesde(job.acf?.fecha ?? job.date, hoy)
        return dias !== null && dias <= maxDias
    })

export const eventosProximos = (eventos, limite = 3, hoy = new Date()) =>
    eventos
        .filter((evento) => {
            const inicio = parseFecha(evento.acf?.fecha_ini)
            return inicio !== null && inicio > hoy
        })
        .sort((a, b) => parseFecha(a.acf.fecha_ini) - parseFecha(b.acf.fecha_ini))
        .slice(0, limite)

// Solo permite http(s) para enlaces que vienen del CMS (evita 'javascript:' y similares).
export const urlSegura = (url) => {
    if (typeof url !== 'string') return null
    try {
        const { protocol } = new URL(url)
        return protocol === 'http:' || protocol === 'https:' ? url : null
    } catch {
        return null
    }
}
