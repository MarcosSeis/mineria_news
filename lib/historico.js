import axios from 'axios'

const API_HISTORICO = 'https://query1.finance.yahoo.com/v8/finance/chart'
const TTL_MS = 60 * 60 * 1000

// Futuros COMEX; coinciden con los símbolos de lib/metales.js
const SIMBOLOS_FUTUROS = { XAU: 'GC=F', XAG: 'SI=F', HG: 'HG=F', XPT: 'PL=F', XPD: 'PA=F' }

let cache = { datos: null, expira: 0 }

async function fetchSerie(symbol, futuro) {
    const { data } = await axios.get(`${API_HISTORICO}/${encodeURIComponent(futuro)}`, {
        params: { interval: '1d', range: '3mo' },
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 5000
    })
    const resultado = data?.chart?.result?.[0]
    const cierres = resultado?.indicators?.quote?.[0]?.close
    if (!resultado?.timestamp || !Array.isArray(cierres)) throw new Error(`histórico inválido para ${symbol}`)

    const serie = resultado.timestamp
        .map((t, i) => ({ fecha: new Date(t * 1000).toISOString().slice(0, 10), precio: cierres[i] }))
        .filter(p => typeof p.precio === 'number')
    return [symbol, serie]
}

// Devuelve { XAU: [{fecha, precio}], ... }; omite los metales que fallen y {} si todo falla.
export async function fetchHistorico() {
    if (cache.datos && Date.now() < cache.expira) return cache.datos

    const resultados = await Promise.allSettled(
        Object.entries(SIMBOLOS_FUTUROS).map(([symbol, futuro]) => fetchSerie(symbol, futuro))
    )
    const datos = Object.fromEntries(
        resultados.filter(r => r.status === 'fulfilled' && r.value[1].length > 1).map(r => r.value)
    )
    resultados.filter(r => r.status === 'rejected')
        .forEach(r => console.error(`[historico] ${r.reason.message}`))

    if (Object.keys(datos).length) cache = { datos, expira: Date.now() + TTL_MS }
    else if (cache.datos) return cache.datos
    return datos
}
