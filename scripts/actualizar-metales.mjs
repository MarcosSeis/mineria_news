// Descarga el precio del día y los cierres recientes, y los agrega a data/metales.json.
// Uso: npm run actualizar:metales   (se ejecuta una vez al día desde .github/workflows/metales.yml)
import { readFile, writeFile } from 'node:fs/promises'
import { CONFIG_METALES, parsearSerieYahoo, fusionarSerie } from './metales-datos.mjs'

const ARCHIVO = new URL('../data/metales.json', import.meta.url)
const API_SPOT = 'https://api.gold-api.com/price'
const API_HISTORICO = 'https://query1.finance.yahoo.com/v8/finance/chart'

async function leerJson(url) {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(15000) })
    if (!res.ok) throw new Error(`${res.status} ${url}`)
    return res.json()
}

async function leerArchivo() {
    try {
        return JSON.parse(await readFile(ARCHIVO, 'utf8'))
    } catch {
        return { actualizado: null, metales: [] }
    }
}

async function actualizarMetal({ symbol, futuro, nombre, unidad }, previo) {
    // Primera vez: baja un año de historia; después solo los últimos días.
    const rango = previo?.serie?.length ? '5d' : '1y'
    const [spot, historico] = await Promise.all([
        leerJson(`${API_SPOT}/${symbol}`),
        leerJson(`${API_HISTORICO}/${encodeURIComponent(futuro)}?interval=1d&range=${rango}`)
    ])
    if (typeof spot.price !== 'number') throw new Error(`precio inválido para ${symbol}`)

    return {
        symbol, nombre, unidad,
        precio: spot.price,
        actualizadoEn: spot.updatedAt,
        serie: fusionarSerie(previo?.serie, parsearSerieYahoo(historico))
    }
}

const guardado = await leerArchivo()
const resultados = await Promise.allSettled(CONFIG_METALES.map(config =>
    actualizarMetal(config, guardado.metales.find(m => m.symbol === config.symbol))
))

// Si un metal falla se conserva lo que ya había guardado de él.
const metales = CONFIG_METALES.map((config, i) => {
    const r = resultados[i]
    if (r.status === 'fulfilled') return r.value
    console.error(`[metales] ${config.symbol}: ${r.reason.message} (se conserva el dato anterior)`)
    return guardado.metales.find(m => m.symbol === config.symbol)
}).filter(Boolean)

if (resultados.every(r => r.status === 'rejected')) {
    console.error('[metales] Ninguna API respondió; no se modificó data/metales.json')
    process.exit(1)
}

await writeFile(ARCHIVO, JSON.stringify({ actualizado: new Date().toISOString().slice(0, 10), metales }, null, 2) + '\n')
console.log(`[metales] Actualizados ${resultados.filter(r => r.status === 'fulfilled').length}/${CONFIG_METALES.length}`)
