import { useEffect } from 'react'
import Router from 'next/router'

export const INTERVALO_ACTUALIZACION = 60_000

// Mantiene al día una página ISR que el usuario tiene abierta: cada `intervalo` (y al volver a la
// pestaña) vuelve a pedir sus props con router.replace, sin recargar ni mover el scroll.
// Solo trabaja con la pestaña visible, para no gastar peticiones en segundo plano.
export default function useActualizacionAutomatica(intervalo = INTERVALO_ACTUALIZACION) {
    useEffect(() => {
        if (!Router.router) return      // fuera de una app Next montada (p. ej. pruebas de páginas)

        let enCurso = false
        const actualizar = async () => {
            if (document.visibilityState !== 'visible' || enCurso) return
            enCurso = true
            try {
                await Router.replace(Router.asPath, undefined, { scroll: false })
            } catch {
                // sin conexión o despliegue nuevo: se reintenta en el siguiente ciclo
            } finally {
                enCurso = false
            }
        }
        const alVolver = () => {
            if (document.visibilityState === 'visible') actualizar()
        }

        const id = setInterval(actualizar, intervalo)
        document.addEventListener('visibilitychange', alVolver)
        return () => {
            clearInterval(id)
            document.removeEventListener('visibilitychange', alVolver)
        }
    }, [intervalo])
}
