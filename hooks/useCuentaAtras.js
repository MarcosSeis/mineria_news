import { useEffect, useState } from 'react'
import { msHastaProximoReto } from '@/lib/voladura/challengeEngine'

export function formatearCuentaAtras(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const dos = (n) => String(n).padStart(2, '0')
  return `${dos(Math.floor(total / 3600))}:${dos(Math.floor((total % 3600) / 60))}:${dos(total % 60)}`
}

// Cuenta atrás hasta el próximo reto (medianoche local). Cuando cambia el día llama a alTerminar.
// "dia" identifica el reto en curso: al cambiarlo la cuenta atrás se reinicia.
export default function useCuentaAtras(activo, alTerminar, dia) {
  const [ms, setMs] = useState(null)

  useEffect(() => {
    if (!activo) return undefined
    const inicio = new Date().toDateString()
    const tic = () => {
      const ahora = new Date()
      setMs(msHastaProximoReto(ahora))
      if (ahora.toDateString() !== inicio) alTerminar?.()
    }
    tic()
    const id = setInterval(tic, 1000)
    return () => clearInterval(id)
  }, [activo, alTerminar, dia])

  return ms === null ? '--:--:--' : formatearCuentaAtras(ms)
}
