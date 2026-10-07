import { useState } from "react";
import styles from '@/styles/grafica.module.css';
import { formatearPrecio } from '@/lib/metales';

const RANGOS = [{ id: '1m', texto: '1 mes', dias: 22 }, { id: '3m', texto: '3 meses', dias: 66 }, { id: '1a', texto: '1 año', dias: Infinity }]
const ANCHO = 600, ALTO = 260, MARGEN = { arriba: 16, derecha: 16, abajo: 28, izquierda: 64 }

const formatearFecha = (fecha) =>
    new Date(`${fecha}T12:00:00Z`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' })

export default function GraficaMetal({ metales, inicial }) {
  const disponibles = metales.filter(m => m.serie?.length > 1)
  const [symbol, setSymbol] = useState(disponibles.some(m => m.symbol === inicial) ? inicial : disponibles[0]?.symbol)
  const [rango, setRango] = useState('1m')
  const [activo, setActivo] = useState(null)

  if (!disponibles.length) return null

  const metal = disponibles.find(m => m.symbol === symbol) ?? disponibles[0]
  const dias = RANGOS.find(r => r.id === rango).dias
  const serie = metal.serie.slice(-dias)

  const precios = serie.map(p => p.precio)
  const min = Math.min(...precios), max = Math.max(...precios)
  const holgura = (max - min) * 0.1 || 1
  const [y0, y1] = [min - holgura, max + holgura]

  const x = (i) => MARGEN.izquierda + (i / (serie.length - 1)) * (ANCHO - MARGEN.izquierda - MARGEN.derecha)
  const y = (v) => MARGEN.arriba + ((y1 - v) / (y1 - y0)) * (ALTO - MARGEN.arriba - MARGEN.abajo)
  const linea = serie.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.precio).toFixed(1)}`).join(' ')
  const marcas = [y0 + holgura, (min + max) / 2, y1 - holgura]

  const variacion = (serie.at(-1).precio / serie[0].precio - 1) * 100
  const puntoActivo = activo !== null ? serie[Math.min(activo, serie.length - 1)] : null
  const iActivo = puntoActivo ? serie.indexOf(puntoActivo) : null

  const mover = (e) => {
    const caja = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - caja.left) / caja.width) * ANCHO
    const i = Math.round(((px - MARGEN.izquierda) / (ANCHO - MARGEN.izquierda - MARGEN.derecha)) * (serie.length - 1))
    setActivo(Math.max(0, Math.min(serie.length - 1, i)))
  }

  return (
    <div className={styles.grafica} id="grafica">
        <div className={styles.controles}>
            <div role="group" aria-label="Metal" className={styles.grupo}>
                {disponibles.map(m => (
                    <button key={m.symbol} type="button" aria-pressed={m.symbol === metal.symbol}
                        className={m.symbol === metal.symbol ? styles.activo : ''}
                        onClick={() => { setSymbol(m.symbol); setActivo(null) }}>{m.nombre}</button>
                ))}
            </div>
            <div role="group" aria-label="Rango" className={styles.grupo}>
                {RANGOS.map(r => (
                    <button key={r.id} type="button" aria-pressed={r.id === rango}
                        className={r.id === rango ? styles.activo : ''}
                        onClick={() => { setRango(r.id); setActivo(null) }}>{r.texto}</button>
                ))}
            </div>
        </div>

        <p className={styles.resumen}>
            {metal.nombre}: <strong>{formatearPrecio(serie.at(-1).precio)}</strong>{' '}
            <span>{variacion >= 0 ? '▲' : '▼'} {Math.abs(variacion).toFixed(1)}% en el periodo</span>
        </p>

        <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} role="img"
            aria-label={`Gráfica de precio de ${metal.nombre}, ${formatearFecha(serie[0].fecha)} a ${formatearFecha(serie.at(-1).fecha)}`}
            onMouseMove={mover} onMouseLeave={() => setActivo(null)}>
            {marcas.map(v => (
                <g key={v}>
                    <line className={styles.rejilla} x1={MARGEN.izquierda} x2={ANCHO - MARGEN.derecha} y1={y(v)} y2={y(v)} />
                    <text className={styles.eje} x={MARGEN.izquierda - 8} y={y(v)} textAnchor="end" dominantBaseline="middle">
                        {formatearPrecio(v)}
                    </text>
                </g>
            ))}
            <text className={styles.eje} x={MARGEN.izquierda} y={ALTO - 6}>{formatearFecha(serie[0].fecha)}</text>
            <text className={styles.eje} x={ANCHO - MARGEN.derecha} y={ALTO - 6} textAnchor="end">{formatearFecha(serie.at(-1).fecha)}</text>
            <path className={styles.linea} d={linea} />
            {puntoActivo && (
                <g>
                    <line className={styles.guia} x1={x(iActivo)} x2={x(iActivo)} y1={MARGEN.arriba} y2={ALTO - MARGEN.abajo} />
                    <circle className={styles.punto} cx={x(iActivo)} cy={y(puntoActivo.precio)} r="5" />
                </g>
            )}
        </svg>

        <p className={styles.lectura} aria-live="polite">
            {puntoActivo
                ? `${formatearFecha(puntoActivo.fecha)}: ${formatearPrecio(puntoActivo.precio)}`
                : 'Pasa el cursor sobre la gráfica para ver el precio de cada día.'}
        </p>
        <p className={styles.fuente}>Cierre diario de futuros COMEX ({metal.unidad}). Fuente: Yahoo Finance</p>
    </div>
  )
}
