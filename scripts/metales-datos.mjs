// Funciones puras para mantener data/metales.json (sin red ni disco, para poder probarlas).

export const CONFIG_METALES = [
    { symbol: 'XAU', futuro: 'GC=F', nombre: 'Oro', unidad: 'USD / onza troy' },
    { symbol: 'XAG', futuro: 'SI=F', nombre: 'Plata', unidad: 'USD / onza troy' },
    { symbol: 'HG', futuro: 'HG=F', nombre: 'Cobre', unidad: 'USD / libra' },
    { symbol: 'XPT', futuro: 'PL=F', nombre: 'Platino', unidad: 'USD / onza troy' },
    { symbol: 'XPD', futuro: 'PA=F', nombre: 'Paladio', unidad: 'USD / onza troy' }
]

export const MAX_PUNTOS = 400

// Convierte la respuesta de Yahoo Finance en [{ fecha, precio }], ignorando cierres nulos.
export function parsearSerieYahoo(respuesta) {
    const resultado = respuesta?.chart?.result?.[0]
    const cierres = resultado?.indicators?.quote?.[0]?.close
    if (!Array.isArray(resultado?.timestamp) || !Array.isArray(cierres)) {
        throw new Error('respuesta de histórico inválida')
    }
    return resultado.timestamp
        .map((t, i) => ({ fecha: new Date(t * 1000).toISOString().slice(0, 10), precio: cierres[i] }))
        .filter(p => typeof p.precio === 'number')
}

// Une la serie guardada con los puntos nuevos: la misma fecha se sobrescribe, el resultado va
// ordenado y se queda con los últimos MAX_PUNTOS.
export function fusionarSerie(existente = [], nuevos = []) {
    const porFecha = new Map(existente.map(p => [p.fecha, p]))
    nuevos.forEach(p => porFecha.set(p.fecha, p))
    return [...porFecha.values()]
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
        .slice(-MAX_PUNTOS)
}
