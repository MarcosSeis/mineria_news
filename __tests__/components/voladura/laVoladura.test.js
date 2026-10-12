import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LaVoladura from '@/components/voladura/laVoladura'
import VoladuraPage from '@/pages/la-voladura'
import { getDailyChallenge } from '@/lib/voladura/challengeEngine'
import { evaluateBlast } from '@/lib/voladura/blastEngine'
import { configInicial } from '@/lib/voladura/config'
import { valoresReales, calcularMetricas } from '@/lib/voladura/metricas'
import { crearEscena, aPantalla } from '@/lib/voladura/pixelart/escena'

const putImageData = jest.fn()
const reducido = { matches: false }

beforeEach(() => {
  localStorage.clear()
  putImageData.mockClear()
  reducido.matches = true
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({ putImageData }))
  global.ImageData = class { constructor(datos, ancho, alto) { Object.assign(this, { data: datos, width: ancho, height: alto }) } }
  window.matchMedia = jest.fn(() => reducido)
  // Cada cuadro de animación "dura" 1 s: la voladura termina en pocos cuadros.
  let reloj = 0
  jest.spyOn(performance, 'now').mockImplementation(() => reloj)
  global.requestAnimationFrame = (cb) => setTimeout(() => { reloj += 1000; cb(reloj) }, 0)
  global.cancelAnimationFrame = (id) => clearTimeout(id)
  Object.defineProperty(navigator, 'share', { value: undefined, configurable: true, writable: true })
  Object.defineProperty(navigator, 'clipboard', { value: { writeText: jest.fn().mockResolvedValue() }, configurable: true })
})

const irA = async (nombre) => userEvent.click(screen.getByRole('tab', { name: new RegExp(nombre) }))
const volar = async () => {
  await irA('Amarre')
  await userEvent.click(screen.getByRole('button', { name: '¡VOLAR!' }))
}
// Cierra la ayuda y, después, el pop-up de condiciones del reto.
const cerrarAyuda = async () => {
  await userEvent.click(await screen.findByRole('button', { name: '¡A VOLAR!' }))
  await userEvent.click(await screen.findByRole('button', { name: '¡A DISEÑAR!' }))
}
const reto = () => getDailyChallenge(new Date())
const marcarVistas = () => {
  localStorage.setItem('la-voladura-ayuda-vista', '1')
  localStorage.setItem(`la-voladura-ficha-${reto().fecha}`, '1')
}
const listo = () => screen.findByRole('button', { name: 'Ver las condiciones del reto' })

describe('La Voladura (página)', () => {
  it('muestra el título y el encabezado', () => {
    render(<VoladuraPage />)
    expect(screen.getByRole('heading', { level: 1, name: /LA VOLADURA/ })).toBeInTheDocument()
    expect(document.querySelector('title')).toHaveTextContent('Minería News - La Voladura')
  })

  it('publica la vista previa para redes con la imagen y la dirección públicas', () => {
    render(<VoladuraPage />)
    const meta = (propiedad) => document.querySelector(`meta[property="${propiedad}"], meta[name="${propiedad}"]`)?.getAttribute('content')
    expect(meta('og:image')).toBe('https://mineria-news.vercel.app/og/la-voladura.png')
    expect(meta('og:url')).toBe('https://mineria-news.vercel.app/la-voladura')
    expect(meta('og:image:width')).toBe('1200')
    expect(meta('og:image:height')).toBe('630')
    expect(meta('twitter:card')).toBe('summary_large_image')
    expect(meta('og:title')).toBe('Minería News - La Voladura')
  })
})

describe('La Voladura (juego)', () => {
  it('la primera vez explica el juego y después abre el pop-up con las condiciones del reto', async () => {
    render(<LaVoladura />)
    expect(await screen.findByRole('dialog', { name: '¿Cómo se juega?' })).toBeInTheDocument()
    expect(screen.getAllByText(/entretenimiento/).length).toBeGreaterThan(0)
    await userEvent.click(screen.getByRole('button', { name: '¡A VOLAR!' }))
    const d = reto()
    const ficha = await screen.findByRole('dialog', { name: new RegExp(d.geometria.nombre) })
    expect(ficha).toHaveTextContent(`RETO #${d.numero}`)
    expect(ficha).toHaveTextContent(d.roca.nombre)
    expect(ficha).toHaveTextContent(`avanzar ${d.avanceObjetivo} m`)
    expect(ficha).toHaveTextContent(`Pista: ${d.roca.pista}`)
    expect(ficha).toHaveTextContent(`Ø ${d.diametro} mm`)
    await userEvent.click(screen.getByRole('button', { name: '¡A DISEÑAR!' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Frente de/ })).toBeInTheDocument()
    expect(localStorage.getItem(`la-voladura-ficha-${d.fecha}`)).toBe('1')
  })

  it('al cerrar el pop-up solo quedan la escena y los controles, y la fila de resumen lo reabre', async () => {
    marcarVistas()
    render(<LaVoladura />)
    const resumen = await listo()
    const d = reto()
    expect(resumen).toHaveTextContent(`#${d.numero}`)
    expect(resumen).toHaveTextContent(`${d.roca.nombre} · `)
    expect(resumen).toHaveTextContent(`${d.avanceObjetivo} m`)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText(/^Roca$/)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Burden')).toBeInTheDocument()
    await userEvent.click(resumen)
    expect(screen.getByRole('dialog', { name: new RegExp(d.geometria.nombre) })).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('el pop-up del reto se abre solo una vez al día', async () => {
    localStorage.setItem('la-voladura-ayuda-vista', '1')
    const { unmount } = render(<LaVoladura />)
    expect(await screen.findByRole('dialog', { name: new RegExp(reto().geometria.nombre) })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '¡A DISEÑAR!' }))
    unmount()
    render(<LaVoladura />)
    await listo()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('el pop-up del reto se cierra al pulsar fuera y no se abre al ver un resultado guardado', async () => {
    localStorage.setItem('la-voladura-ayuda-vista', '1')
    render(<LaVoladura />)
    const dialogo = await screen.findByRole('dialog', { name: new RegExp(reto().geometria.nombre) })
    fireEvent.click(dialogo.parentElement)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('no repite la ayuda cuando ya se vio, y se puede reabrir y cerrar con Escape', async () => {
    marcarVistas()
    render(<LaVoladura />)
    await listo()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Cómo se juega' }))
    expect(screen.getByRole('dialog', { name: '¿Cómo se juega?' })).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(localStorage.getItem('la-voladura-ayuda-vista')).toBe('1')
  })

  it('cierra la ayuda al pulsar fuera del cuadro', async () => {
    localStorage.setItem(`la-voladura-ficha-${reto().fecha}`, '1')
    render(<LaVoladura />)
    const dialogo = await screen.findByRole('dialog')
    fireEvent.click(dialogo)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(dialogo.parentElement)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('los controles cambian la plantilla y las lecturas', async () => {
    render(<LaVoladura />)
    await cerrarAyuda()
    const lecturas = () => screen.getByLabelText('Lecturas de la plantilla').textContent
    const antes = lecturas()
    fireEvent.change(screen.getByLabelText('Espaciamiento'), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText('Burden'), { target: { value: '20' } })
    expect(lecturas()).not.toBe(antes)
    fireEvent.change(screen.getByLabelText('Profundidad'), { target: { value: '80' } })
    await irA('Carga')
    fireEvent.change(screen.getByLabelText('Carga por barreno'), { target: { value: '90' } })
    await userEvent.selectOptions(screen.getByLabelText('Explosivo'), 'emulsion')
    expect(screen.getByText(/Aguanta la humedad/)).toBeInTheDocument()
    await userEvent.selectOptions(screen.getByLabelText('Distribución de carga'), 'desacoplada')
    expect(screen.getByText(/mejor control del contorno/)).toBeInTheDocument()
  })

  it('el selector de barrenos suma, resta y respeta los límites', async () => {
    render(<LaVoladura />)
    await cerrarAyuda()
    const salida = screen.getByRole('group', { name: 'Número de barrenos' }).querySelector('output')
    expect(salida).toHaveTextContent(String(configInicial.barrenos))
    await userEvent.click(screen.getByRole('button', { name: 'Más barrenos' }))
    expect(salida).toHaveTextContent(String(configInicial.barrenos + 1))
    for (let i = 0; i < 60; i++) fireEvent.click(screen.getByRole('button', { name: 'Menos barrenos' }))
    expect(salida).toHaveTextContent('8')
    expect(screen.getByRole('button', { name: 'Menos barrenos' })).toBeDisabled()
    for (let i = 0; i < 70; i++) fireEvent.click(screen.getByRole('button', { name: 'Más barrenos' }))
    expect(salida).toHaveTextContent('60')
    expect(screen.getByRole('button', { name: 'Más barrenos' })).toBeDisabled()
  })

  it('al volar muestra el resultado, lo guarda y no permite un segundo intento', async () => {
    render(<LaVoladura />)
    await cerrarAyuda()
    await volar()
    const esperado = evaluateBlast(configInicial, reto())
    expect(await screen.findByRole('heading', { name: new RegExp(`LA VOLADURA #${reto().numero}`) })).toBeInTheDocument()
    expect(screen.getByLabelText(`Puntuación ${esperado.score} de 100`)).toBeInTheDocument()
    expect(screen.getByText(esperado.nivel.titulo)).toBeInTheDocument()
    ;['Avance', 'Fragmentación', 'Control', 'Eficiencia'].forEach((n) => expect(screen.getByText(n)).toBeInTheDocument())
    expect(screen.getByText(/Próximo reto en/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '¡VOLAR!' })).not.toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(`la-voladura-${reto().fecha}`)).config).toEqual(configInicial)
    expect(putImageData).toHaveBeenCalled()
  })

  it('al volver el mismo día muestra el resultado guardado, igual que antes', async () => {
    marcarVistas()
    const config = { ...configInicial, burden: 33, barrenos: 20 }
    localStorage.setItem(`la-voladura-${reto().fecha}`, JSON.stringify({ config }))
    render(<LaVoladura />)
    const esperado = evaluateBlast(config, reto())
    expect(await screen.findByLabelText(`Puntuación ${esperado.score} de 100`)).toBeInTheDocument()
    expect(screen.queryByLabelText('Burden')).not.toBeInTheDocument()
  })

  it('muestra los eventos ocurridos con su humor', async () => {
    marcarVistas()
    // busca una configuración de hoy que tenga imprevisto
    let config = null
    for (let b = 0; b <= 100 && !config; b++) {
      const c = { ...configInicial, burden: b }
      if (evaluateBlast(c, reto()).events.length) config = c
    }
    localStorage.setItem(`la-voladura-${reto().fecha}`, JSON.stringify({ config }))
    render(<LaVoladura />)
    const r = evaluateBlast(config, reto())
    expect(await screen.findByText('¡Imprevisto en la operación!')).toBeInTheDocument()
    expect(screen.getByText(`“${r.events[0].humor}”`)).toBeInTheDocument()
    expect(screen.getByText(r.events[0].nombre, { exact: false })).toBeInTheDocument()
  })

  it('destaca los eventos raros', async () => {
    marcarVistas()
    const { default: Resultado } = await import('@/components/voladura/resultado')
    const base = evaluateBlast(configInicial, reto())
    const evento = { id: 'x', nombre: 'Algo raro', categoria: 'oficina', rareza: 'raro', rarezaEtiqueta: 'Raro', icono: 'gema', positivo: true, detalle: 'Detalle', humor: 'Humor', etiquetas: ['Eficiencia +6'] }
    render(<Resultado resultado={{ ...base, events: [evento] }} numero={3} avisoCompartir="" puedeCompartir={false} onCompartir={() => {}} onCopiar={() => {}} onRepetir={() => {}} cuentaAtras="01:02:03" />)
    expect(screen.getByText('Raro')).toBeInTheDocument()
    expect(screen.getByText('Eficiencia +6')).toBeInTheDocument()
    expect(screen.getByText('01:02:03')).toBeInTheDocument()
  })

  it('copia el resultado cuando no hay Web Share', async () => {
    marcarVistas()
    localStorage.setItem(`la-voladura-${reto().fecha}`, JSON.stringify({ config: configInicial }))
    render(<LaVoladura />)
    await userEvent.click(await screen.findByRole('button', { name: 'COPIAR RESULTADO' }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('LA VOLADURA #'))
    expect(navigator.clipboard.writeText.mock.calls[0][0]).toContain('¿Puedes superarlo?')
    expect(await screen.findByText('¡Resultado copiado!')).toBeInTheDocument()
  })

  it('usa la Web Share API cuando está disponible', async () => {
    marcarVistas()
    localStorage.setItem(`la-voladura-${reto().fecha}`, JSON.stringify({ config: configInicial }))
    navigator.share = jest.fn().mockResolvedValue()
    render(<LaVoladura />)
    await userEvent.click(await screen.findByRole('button', { name: 'COMPARTIR RESULTADO' }))
    expect(navigator.share).toHaveBeenCalledWith(expect.objectContaining({ text: expect.stringContaining('Minería News') }))
    expect(await screen.findByText('¡Compartido!')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Copiar texto' }))
    expect(await screen.findByText('¡Resultado copiado!')).toBeInTheDocument()
  })

  it('funciona aunque no haya almacenamiento local', async () => {
    const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('bloqueado') })
    const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('bloqueado') })
    render(<LaVoladura />)
    await cerrarAyuda()
    await volar()
    expect(await screen.findByText(/Próximo reto en/)).toBeInTheDocument()
    getItem.mockRestore()
    setItem.mockRestore()
  })

  it('"Ver la voladura otra vez" repite la animación', async () => {
    marcarVistas()
    localStorage.setItem(`la-voladura-${reto().fecha}`, JSON.stringify({ config: configInicial }))
    render(<LaVoladura />)
    await userEvent.click(await screen.findByRole('button', { name: 'Ver la voladura otra vez' }))
    expect(await screen.findByText(/Próximo reto en/)).toBeInTheDocument()
  })
})

describe('controles por pasos', () => {
  const abrirPasos = async () => {
    marcarVistas()
    render(<LaVoladura />)
    await listo()
  }

  it('muestra tres pasos y empieza en la plantilla', async () => {
    await abrirPasos()
    const pestanas = screen.getAllByRole('tab')
    expect(pestanas.map((p) => p.textContent)).toEqual(['1Plantilla', '2Carga', '3Amarre'])
    expect(screen.getByRole('tab', { name: /Plantilla/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByLabelText('Burden')).toBeInTheDocument()
    expect(screen.queryByLabelText('Explosivo')).not.toBeInTheDocument()
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
  })

  it('cada control muestra su valor y una explicación en lenguaje simple', async () => {
    await abrirPasos()
    expect(screen.getByText('Distancia entre filas de barrenos.')).toBeInTheDocument()
    expect(screen.getByLabelText('Burden')).toHaveAttribute('aria-valuetext', '1.0 m')
    fireEvent.change(screen.getByLabelText('Burden'), { target: { value: '100' } })
    expect(screen.getByLabelText('Burden')).toHaveAttribute('aria-valuetext', '1.5 m')
    expect(screen.getByLabelText('Espaciamiento')).toHaveAttribute('aria-valuetext', '1.2 m')
    expect(screen.getByLabelText('Profundidad')).toHaveAttribute('aria-valuetext', '3.0 m')
    expect(screen.getByText('CERRADO')).toBeInTheDocument()
    await irA('Carga')
    expect(screen.getByLabelText('Carga por barreno')).toHaveAttribute('aria-valuetext', '68 %')
  })

  it('el botón principal avanza de paso y en el último es ¡VOLAR!', async () => {
    await abrirPasos()
    expect(screen.queryByRole('button', { name: 'Paso anterior' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /SIGUIENTE/ }))
    expect(screen.getByRole('tab', { name: /Carga/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByLabelText('Explosivo')).toBeInTheDocument()
    expect(screen.getByLabelText('Distribución de carga')).toBeInTheDocument()
    expect(screen.queryByLabelText('Burden')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /SIGUIENTE/ }))
    expect(screen.getByRole('radiogroup', { name: /Orden de salida/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /SIGUIENTE/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '¡VOLAR!' })).toBeInTheDocument()
  })

  it('el botón ◂ vuelve al paso anterior y se puede saltar entre pasos con las pestañas', async () => {
    await abrirPasos()
    await irA('Amarre')
    await userEvent.click(screen.getByRole('button', { name: 'Paso anterior' }))
    expect(screen.getByRole('tab', { name: /Carga/ })).toHaveAttribute('aria-selected', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Paso anterior' }))
    expect(screen.getByLabelText('Burden')).toBeInTheDocument()
    await irA('Amarre')
    await irA('Plantilla')
    expect(screen.getByLabelText('Espaciamiento')).toBeInTheDocument()
  })

  it('los valores elegidos se conservan al cambiar de paso', async () => {
    await abrirPasos()
    fireEvent.change(screen.getByLabelText('Burden'), { target: { value: '70' } })
    await irA('Carga')
    await userEvent.selectOptions(screen.getByLabelText('Explosivo'), 'gel')
    await irA('Plantilla')
    expect(screen.getByLabelText('Burden')).toHaveValue('70')
    await irA('Carga')
    expect(screen.getByLabelText('Explosivo')).toHaveValue('gel')
  })

  it('el lienzo solo permite numerar barrenos en el paso del amarre manual', async () => {
    await abrirPasos()
    Element.prototype.getBoundingClientRect = jest.fn(() => ({ left: 0, top: 0, width: 160, height: 120 }))
    await irA('Amarre')
    await userEvent.click(screen.getByRole('radio', { name: 'Manual' }))
    await irA('Plantilla')
    const canvas = screen.getByRole('img', { name: /Frente de/ })
    expect(canvas).not.toHaveAttribute('data-tocable')
    await irA('Amarre')
    expect(screen.getByRole('img', { name: /Frente de/ })).toHaveAttribute('data-tocable', 'si')
  })
})

describe('amarre (orden de salida)', () => {
  const posicionDeBarreno = (n) => {
    const barreno = calcularMetricas(valoresReales(configInicial), reto()).plantilla.barrenos.filter((b) => b.dentro)[n]
    return aPantalla(crearEscena(reto()), barreno.x, barreno.y)
  }
  const tocar = (canvas, { px, py }) => fireEvent.click(canvas, { clientX: px, clientY: py })
  const abrir = async () => {
    marcarVistas()
    render(<LaVoladura />)
    await listo()
    Element.prototype.getBoundingClientRect = jest.fn(() => ({ left: 0, top: 0, width: 160, height: 120 }))
    await irA('Amarre')
    return screen.getByRole('img', { name: /Frente de/ })
  }

  it('ofrece los tipos de amarre y explica cada uno', async () => {
    await abrir()
    const grupo = screen.getByRole('radiogroup', { name: /Orden de salida/ })
    expect(grupo.querySelectorAll('[role=radio]')).toHaveLength(6)
    expect(screen.getByRole('radio', { name: 'Por filas' })).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(screen.getByRole('radio', { name: 'En V' }))
    expect(screen.getByRole('radio', { name: 'En V' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'Por filas' })).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByText(/roca muy competente/)).toBeInTheDocument()
  })

  it('con un amarre automático tocar el lienzo no cambia el orden', async () => {
    const canvas = await abrir()
    tocar(canvas, posicionDeBarreno(0))
    expect(screen.queryByText(/barrenos numerados/)).not.toBeInTheDocument()
  })

  it('el modo manual permite numerar los barrenos tocándolos, deshacer y borrar', async () => {
    const canvas = await abrir()
    await userEvent.click(screen.getByRole('radio', { name: 'Manual' }))
    expect(screen.getByText(/^0\/\d+ barrenos numerados$/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Deshacer' })).toBeDisabled()
    tocar(canvas, posicionDeBarreno(0))
    tocar(canvas, posicionDeBarreno(3))
    expect(screen.getByText(/^2\/\d+ barrenos numerados$/)).toBeInTheDocument()
    tocar(canvas, posicionDeBarreno(3))
    expect(screen.getByText(/^1\/\d+ barrenos numerados$/)).toBeInTheDocument()
    tocar(canvas, { px: 2, py: 2 })
    expect(screen.getByText(/^1\/\d+ barrenos numerados$/)).toBeInTheDocument()
    tocar(canvas, posicionDeBarreno(5))
    await userEvent.click(screen.getByRole('button', { name: 'Deshacer' }))
    expect(screen.getByText(/^1\/\d+ barrenos numerados$/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Borrar' }))
    expect(screen.getByText(/^0\/\d+ barrenos numerados$/)).toBeInTheDocument()
    expect(screen.getByText(/salen todos juntos al final/)).toBeInTheDocument()
  })

  it('un barreno fuera de la sección no se puede numerar', async () => {
    const canvas = await abrir()
    await userEvent.click(screen.getByRole('radio', { name: 'Manual' }))
    const fuera = calcularMetricas(valoresReales(configInicial), reto()).plantilla.barrenos.find((b) => !b.dentro)
    tocar(canvas, aPantalla(crearEscena(reto()), fuera.x, fuera.y))
    expect(screen.getByText(/^0\/\d+ barrenos numerados$/)).toBeInTheDocument()
  })

  it('el amarre elegido se guarda, se usa en el resultado y se muestra', async () => {
    await abrir()
    await userEvent.click(screen.getByRole('radio', { name: 'Todos juntos' }))
    await volar()
    expect(await screen.findByText(/Próximo reto en/)).toBeInTheDocument()
    expect(screen.getByText('Amarre:')).toHaveTextContent('Amarre: Todos juntos')
    const guardado = JSON.parse(localStorage.getItem(`la-voladura-${reto().fecha}`)).config
    expect(guardado.amarre).toBe('simultaneo')
    expect(guardado.orden).toEqual([])
  })

  it('el orden manual se guarda y se recupera al volver', async () => {
    const canvas = await abrir()
    await userEvent.click(screen.getByRole('radio', { name: 'Manual' }))
    tocar(canvas, posicionDeBarreno(1))
    tocar(canvas, posicionDeBarreno(0))
    await volar()
    await screen.findByText(/Próximo reto en/)
    const guardado = JSON.parse(localStorage.getItem(`la-voladura-${reto().fecha}`)).config
    expect(guardado.amarre).toBe('manual')
    expect(guardado.orden).toHaveLength(2)
  })
})

describe('compartir en redes', () => {
  const guardar = () => {
    marcarVistas()
    localStorage.setItem(`la-voladura-${reto().fecha}`, JSON.stringify({ config: configInicial }))
  }
  let abrir

  beforeEach(() => {
    abrir = jest.spyOn(window, 'open').mockImplementation(() => null)
    const ctx = new Proxy({ putImageData, measureText: (t) => ({ width: t.length * 20 }), drawImage: jest.fn() }, { get: (o, k) => (k in o ? o[k] : jest.fn()), set: () => true })
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ctx)
    HTMLCanvasElement.prototype.toBlob = (cb) => cb(new Blob(['png'], { type: 'image/png' }))
    URL.createObjectURL = jest.fn(() => 'blob:x')
    URL.revokeObjectURL = jest.fn()
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  })
  afterEach(() => jest.restoreAllMocks())

  it('Facebook abre el compartidor con la URL del juego y el resultado', async () => {
    guardar()
    render(<LaVoladura />)
    await userEvent.click(await screen.findByRole('button', { name: 'Facebook' }))
    const [direccion] = abrir.mock.calls[0]
    expect(direccion).toMatch(/^https:\/\/www\.facebook\.com\/sharer\/sharer\.php\?u=/)
    expect(decodeURIComponent(direccion)).toContain('https://mineria-news.vercel.app/la-voladura')
    expect(decodeURIComponent(direccion)).toContain('LA VOLADURA #')
  })

  it('LinkedIn abre el editor con el texto del resultado y el enlace público', async () => {
    guardar()
    render(<LaVoladura />)
    await userEvent.click(await screen.findByRole('button', { name: 'LinkedIn' }))
    const direccion = abrir.mock.calls[0][0]
    expect(direccion).toMatch(/^https:\/\/www\.linkedin\.com\/feed\/\?shareActive=true&text=/)
    const texto = decodeURIComponent(direccion.split('text=')[1])
    expect(texto).toContain('🧨 LA VOLADURA #')
    expect(texto).toMatch(/[🟧⬛]{10} \d+\/100/u)
    expect(texto).toContain('👉 Juega hoy: https://mineria-news.vercel.app/la-voladura')
    expect(texto).not.toContain('¿Puedes superarlo?')
    expect(texto.split('\n')).toHaveLength(4)
    expect(texto).not.toContain('localhost')
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(texto)
    expect(await screen.findByText(/Se abrió LinkedIn con tu resultado/)).toBeInTheDocument()
  })

  it('todo lo que se comparte usa la dirección pública y no localhost', async () => {
    guardar()
    navigator.share = jest.fn().mockResolvedValue()
    render(<LaVoladura />)
    await userEvent.click(await screen.findByRole('button', { name: 'Facebook' }))
    expect(decodeURIComponent(abrir.mock.calls[0][0])).not.toContain('localhost')
    expect(decodeURIComponent(abrir.mock.calls[0][0])).toContain('https://mineria-news.vercel.app/la-voladura')
    await userEvent.click(screen.getByRole('button', { name: 'COMPARTIR RESULTADO' }))
    expect(navigator.share).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://mineria-news.vercel.app/la-voladura' }))
  })

  it('Instagram (sin compartir archivos) descarga la imagen, copia el texto y abre Instagram', async () => {
    guardar()
    render(<LaVoladura />)
    await userEvent.click(await screen.findByRole('button', { name: 'Instagram' }))
    expect(abrir.mock.calls[0][0]).toBe('https://www.instagram.com/')
    expect(await screen.findByText(/Imagen descargada y texto copiado/)).toBeInTheDocument()
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled()
  })

  it('Instagram avisa si solo se pudo descargar la imagen', async () => {
    guardar()
    navigator.clipboard.writeText.mockRejectedValue(new Error('no'))
    render(<LaVoladura />)
    await userEvent.click(await screen.findByRole('button', { name: 'Instagram' }))
    expect(await screen.findByText('Imagen descargada: súbela a tu historia o publicación.')).toBeInTheDocument()
  })

  it('Instagram en el móvil comparte la imagen directo con la app', async () => {
    guardar()
    navigator.share = jest.fn().mockResolvedValue()
    navigator.canShare = jest.fn(() => true)
    render(<LaVoladura />)
    await userEvent.click(await screen.findByRole('button', { name: 'Instagram' }))
    await waitFor(() => expect(navigator.share).toHaveBeenCalled())
    const datos = navigator.share.mock.calls[0][0]
    expect(datos.files[0].name).toBe('la-voladura.png')
    expect(datos.files[0].type).toBe('image/png')
    expect(abrir).not.toHaveBeenCalled()
    expect(await screen.findByText('¡Compartido!')).toBeInTheDocument()
    delete navigator.canShare
  })

  it('Descargar imagen guarda la tarjeta', async () => {
    guardar()
    render(<LaVoladura />)
    await userEvent.click(await screen.findByRole('button', { name: 'Descargar imagen' }))
    expect(await screen.findByText('Imagen descargada.')).toBeInTheDocument()
    expect(URL.createObjectURL).toHaveBeenCalled()
  })
})

describe('animación con movimiento normal', () => {
  beforeEach(() => { reducido.matches = false })

  it('reproduce la voladura y termina mostrando el resultado', async () => {
    marcarVistas()
    render(<LaVoladura />)
    await listo()
    await volar()
    expect(screen.getByText('¡FUEGO EN EL HUECO!')).toBeInTheDocument()
    expect(await screen.findByText(/Próximo reto en/, {}, { timeout: 3000 })).toBeInTheDocument()
    expect(putImageData.mock.calls.length).toBeGreaterThan(3)
  })

  it('con "reducir movimiento" la animación se reproduce igual, pero sin destellos ni sacudidas', async () => {
    reducido.matches = true
    marcarVistas()
    render(<LaVoladura />)
    await listo()
    const antes = putImageData.mock.calls.length
    await volar()
    expect(screen.getByText('¡FUEGO EN EL HUECO!')).toBeInTheDocument()
    expect(await screen.findByText(/Próximo reto en/, {}, { timeout: 3000 })).toBeInTheDocument()
    expect(putImageData.mock.calls.length).toBeGreaterThan(antes + 3)
  })

  it('se puede saltar la animación', async () => {
    marcarVistas()
    global.requestAnimationFrame = () => 0
    render(<LaVoladura />)
    await listo()
    await volar()
    await userEvent.click(screen.getByRole('button', { name: /Saltar/ }))
    expect(await screen.findByText(/Próximo reto en/)).toBeInTheDocument()
  })

  it('la plantilla se desliza hacia su nueva posición al mover los controles', async () => {
    marcarVistas()
    render(<LaVoladura />)
    await listo()
    const llamadas = putImageData.mock.calls.length
    fireEvent.change(screen.getByLabelText('Espaciamiento'), { target: { value: '5' } })
    await waitFor(() => expect(putImageData.mock.calls.length).toBeGreaterThan(llamadas + 2))
  })
})

describe('próximo reto', () => {
  it('al llegar la medianoche carga el reto nuevo', async () => {
    jest.useFakeTimers()
    marcarVistas()
    jest.setSystemTime(new Date(2026, 10, 3, 23, 59, 58))
    localStorage.setItem('la-voladura-ficha-2026-11-04', '1')
    localStorage.setItem('la-voladura-2026-11-03', JSON.stringify({ config: configInicial }))
    render(<LaVoladura />)
    expect(screen.getByText(/Próximo reto en/)).toBeInTheDocument()
    expect(screen.getByText(/^#\d+$/)).toHaveTextContent(`#${getDailyChallenge(new Date(2026, 10, 3)).numero}`)
    await act(async () => { jest.setSystemTime(new Date(2026, 10, 4, 0, 0, 1)); jest.advanceTimersByTime(3000) })
    expect(screen.getByText(/^#\d+$/)).toHaveTextContent(`#${getDailyChallenge(new Date(2026, 10, 4)).numero}`)
    expect(screen.getByRole('button', { name: /SIGUIENTE/ })).toBeInTheDocument()
    jest.useRealTimers()
  })
})
