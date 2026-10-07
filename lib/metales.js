import axios from 'axios'

const API_METALES = 'https://api.gold-api.com/price'
const TTL_MS = 5 * 60 * 1000

export const METALES = [
    { symbol: 'XAU', nombre: 'Oro', unidad: 'USD / onza troy' },
    { symbol: 'XAG', nombre: 'Plata', unidad: 'USD / onza troy' },
    { symbol: 'HG', nombre: 'Cobre', unidad: 'USD / libra' },
    { symbol: 'XPT', nombre: 'Platino', unidad: 'USD / onza troy' },
    { symbol: 'XPD', nombre: 'Paladio', unidad: 'USD / onza troy' }
]

let cache = { datos: null, expira: 0 }

async function fetchMetal({ symbol, nombre, unidad }) {
    const { data } = await axios.get(`${API_METALES}/${symbol}`, { timeout: 5000 })
    if (typeof data?.price !== 'number') throw new Error(`respuesta inválida para ${symbol}`)
    return { symbol, nombre, unidad, precio: data.price, actualizado: data.updatedAt }
}

// Omite los metales que fallen; devuelve [] si ninguno responde, para que las páginas no se caigan.
export async function fetchPrecios() {
    if (cache.datos && Date.now() < cache.expira) return cache.datos

    const resultados = await Promise.allSettled(METALES.map(fetchMetal))
    const datos = resultados.filter(r => r.status === 'fulfilled').map(r => r.value)
    resultados.filter(r => r.status === 'rejected')
        .forEach(r => console.error(`[metales] ${r.reason.message}`))

    if (datos.length) cache = { datos, expira: Date.now() + TTL_MS }
    else if (cache.datos) return cache.datos
    return datos
}

export const formatearPrecio = (precio) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(precio)
