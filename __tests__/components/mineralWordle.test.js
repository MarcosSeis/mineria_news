import { render, screen, fireEvent, act } from '@testing-library/react'
import MineralWordle from '@/components/mineralWordle'
import { minerales } from '@/data/minerales'
import { mineralDelDia, fechaLocal } from '@/lib/mineralWordle'

const secreta = mineralDelDia(new Date(), minerales).palabra
const otra = secreta.replace(/./g, 'X')

const escribir = (palabra) => [...palabra].forEach((l) => fireEvent.keyDown(window, { key: l }))

describe('MineralWordle', () => {
  const CLAVE = 'mineral-wordle-instrucciones-vistas'
  // Por defecto el jugador ya vio las instrucciones, así que el cuadro no estorba.
  beforeEach(() => { localStorage.clear(); localStorage.setItem(CLAVE, '1') })

  it('muestra el tablero con el largo del mineral del día', () => {
    render(<MineralWordle />)
    expect(screen.getAllByRole('gridcell')).toHaveLength(secreta.length * 6)
    expect(screen.getByText(`${secreta.length} letras · intento 1 de 6`)).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('ignora Enter si la palabra está incompleta', () => {
    render(<MineralWordle />)
    escribir(secreta.slice(0, 2))
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(screen.getAllByRole('gridcell')[0]).not.toHaveAttribute('data-estado', 'correcta')
  })

  it('permite borrar y escribir con el teclado en pantalla', () => {
    render(<MineralWordle />)
    fireEvent.click(screen.getByRole('button', { name: 'Q' }))
    expect(screen.getAllByRole('gridcell')[0]).toHaveTextContent('Q')
    fireEvent.click(screen.getByRole('button', { name: 'Borrar' }))
    expect(screen.getAllByRole('gridcell')[0]).toHaveTextContent('')
  })

  const ganar = () => {
    render(<MineralWordle />)
    escribir(secreta)
    fireEvent.keyDown(window, { key: 'Enter' })
  }

  it('gana al acertar y permite copiar el resultado', async () => {
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue() } })
    ganar()
    expect(screen.getByRole('status')).toHaveTextContent('¡Excelente!')
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Copiar resultado' })) })
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining(window.location.origin + '/mineral-wordle'))
    expect(screen.getByText('¡Copiado!')).toBeInTheDocument()
  })

  it('avisa si no se puede copiar', async () => {
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockRejectedValue(new Error('no')) } })
    ganar()
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Copiar resultado' })) })
    expect(screen.getByText('No se pudo copiar')).toBeInTheDocument()
  })

  it('comparte en Facebook abriendo el enlace de compartir', () => {
    window.open = jest.fn()
    ganar()
    fireEvent.click(screen.getByRole('button', { name: 'Facebook' }))
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('facebook.com/sharer/sharer.php?u='), '_blank', expect.stringContaining('noopener')
    )
  })

  it('en Instagram copia el resultado y abre Instagram', async () => {
    window.open = jest.fn()
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue() } })
    ganar()
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Instagram' })) })
    expect(navigator.clipboard.writeText).toHaveBeenCalled()
    expect(window.open).toHaveBeenCalledWith('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
    expect(screen.getByText(/Resultado copiado/)).toBeInTheDocument()
  })

  it('en Instagram avisa si no pudo copiar', async () => {
    window.open = jest.fn()
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockRejectedValue(new Error('no')) } })
    ganar()
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Instagram' })) })
    expect(screen.getByText('No se pudo copiar el resultado')).toBeInTheDocument()
  })

  it('ofrece el menú nativo de compartir solo si el navegador lo soporta', async () => {
    navigator.share = jest.fn().mockResolvedValue()
    ganar()
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Compartir' })) })
    expect(navigator.share).toHaveBeenCalledWith(expect.objectContaining({ url: window.location.origin + '/mineral-wordle' }))
    navigator.share = jest.fn().mockRejectedValue(new Error('cancelado'))
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Compartir' })) })
    delete navigator.share
  })

  it('descarga la imagen del resultado', () => {
    const ctx = { fillRect: jest.fn(), fillText: jest.fn() }
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx)
    jest.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((cb) => cb(new Blob(['x'])))
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    URL.createObjectURL = jest.fn(() => 'blob:x')
    URL.revokeObjectURL = jest.fn()
    jest.useFakeTimers()
    ganar()
    fireEvent.click(screen.getByRole('button', { name: 'Descargar imagen' }))
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled()
    act(() => jest.advanceTimersByTime(1000))
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:x')
    jest.useRealTimers()
    expect(screen.getByText(/Imagen descargada/)).toBeInTheDocument()
    jest.restoreAllMocks()
  })

  it('no muestra el botón nativo si no hay navigator.share', () => {
    ganar()
    expect(screen.queryByRole('button', { name: 'Compartir' })).not.toBeInTheDocument()
  })

  it('pierde tras 6 intentos y muestra la pista desde el tercero', () => {
    render(<MineralWordle />)
    for (let i = 0; i < 3; i++) { escribir(otra); fireEvent.keyDown(window, { key: 'Enter' }) }
    expect(screen.getByText(/💡/)).toBeInTheDocument()
    for (let i = 0; i < 3; i++) { escribir(otra); fireEvent.keyDown(window, { key: 'Enter' }) }
    expect(screen.getByRole('status')).toHaveTextContent('Se acabaron los intentos')
  })

  it('recupera la partida guardada del día', () => {
    const k = `mineral-wordle-${fechaLocal(new Date())}`
    localStorage.setItem(k, JSON.stringify([secreta]))
    render(<MineralWordle />)
    expect(screen.getByRole('status')).toHaveTextContent('¡Excelente!')
  })

  it('no falla si el almacenamiento está corrupto', () => {
    localStorage.setItem(`mineral-wordle-${fechaLocal(new Date())}`, '{mal')
    render(<MineralWordle />)
    expect(screen.getAllByRole('gridcell')).toHaveLength(secreta.length * 6)
  })

  describe('instrucciones', () => {
    beforeEach(() => localStorage.clear())

    it('aparecen en un cuadro la primera vez y se recuerdan al cerrarlas', () => {
      const { unmount } = render(<MineralWordle />)
      expect(screen.getByRole('dialog', { name: '¿Cómo se juega?' })).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: '¡A jugar!' }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(localStorage.getItem(CLAVE)).toBe('1')
      unmount()
      render(<MineralWordle />)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('se cierran con Escape y tocando fuera del cuadro, pero no al tocar dentro', () => {
      render(<MineralWordle />)
      fireEvent.keyDown(window, { key: 'x' })
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      fireEvent.click(screen.getByRole('dialog'))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      fireEvent.keyDown(window, { key: 'Escape' })
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Cómo se juega' }))
      fireEvent.click(screen.getByRole('dialog').parentElement)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('no dejan escribir mientras están abiertas y se pueden volver a abrir con el botón ?', () => {
      render(<MineralWordle />)
      escribir(secreta)
      fireEvent.keyDown(window, { key: 'Enter' })
      expect(screen.getAllByRole('gridcell')[0]).toHaveAttribute('data-estado', 'vacia')
      fireEvent.click(screen.getByRole('button', { name: '¡A jugar!' }))
      fireEvent.click(screen.getByRole('button', { name: 'Cómo se juega' }))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('se muestran si el navegador no permite guardar datos', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('bloqueado') })
      render(<MineralWordle />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      jest.restoreAllMocks()
    })
  })
})
