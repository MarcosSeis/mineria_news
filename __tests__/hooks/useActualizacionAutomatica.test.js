import { render, act } from '@testing-library/react'
import Router from 'next/router'
import useActualizacionAutomatica, { INTERVALO_ACTUALIZACION } from '@/hooks/useActualizacionAutomatica'

jest.mock('next/router', () => ({ __esModule: true, default: {} }))

const Pagina = ({ intervalo }) => {
  useActualizacionAutomatica(intervalo)
  return null
}

const visibilidad = (estado) => {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => estado })
  document.dispatchEvent(new Event('visibilitychange'))
}

const router = Router
beforeEach(() => {
  jest.useFakeTimers()
  Object.assign(Router, { router: {}, asPath: '/', replace: jest.fn(() => Promise.resolve(true)) })
  visibilidad('visible')
  router.replace.mockClear()
})
afterEach(() => { jest.useRealTimers() })

describe('useActualizacionAutomatica', () => {
  it('vuelve a pedir los datos de la página en cada intervalo sin mover el scroll', async () => {
    render(<Pagina />)
    expect(router.replace).not.toHaveBeenCalled()
    await act(async () => { jest.advanceTimersByTime(INTERVALO_ACTUALIZACION) })
    expect(router.replace).toHaveBeenCalledWith('/', undefined, { scroll: false })
    await act(async () => { jest.advanceTimersByTime(INTERVALO_ACTUALIZACION) })
    expect(router.replace).toHaveBeenCalledTimes(2)
  })

  it('no actualiza con la pestaña oculta y lo hace al volver a ella', async () => {
    render(<Pagina intervalo={1000} />)
    visibilidad('hidden')
    await act(async () => { jest.advanceTimersByTime(5000) })
    expect(router.replace).not.toHaveBeenCalled()
    await act(async () => { visibilidad('visible') })
    expect(router.replace).toHaveBeenCalledTimes(1)
  })

  it('no encima peticiones si la anterior sigue en curso', async () => {
    router.replace.mockReturnValue(new Promise(() => {}))
    render(<Pagina intervalo={1000} />)
    await act(async () => { jest.advanceTimersByTime(3000) })
    expect(router.replace).toHaveBeenCalledTimes(1)
  })

  it('tolera errores de red y sigue intentando', async () => {
    router.replace.mockRejectedValueOnce(new Error('offline'))
    render(<Pagina intervalo={1000} />)
    await act(async () => { jest.advanceTimersByTime(1000) })
    await act(async () => { jest.advanceTimersByTime(1000) })
    expect(router.replace).toHaveBeenCalledTimes(2)
  })

  it('deja de actualizar al desmontar la página', async () => {
    const { unmount } = render(<Pagina intervalo={1000} />)
    unmount()
    await act(async () => { jest.advanceTimersByTime(5000); visibilidad('visible') })
    expect(router.replace).not.toHaveBeenCalled()
  })

  it('no hace nada fuera del router de Next (p. ej. en pruebas de páginas)', async () => {
    Router.router = null
    render(<Pagina intervalo={1000} />)
    await act(async () => { jest.advanceTimersByTime(5000) })
    expect(router.replace).not.toHaveBeenCalled()
  })
})
