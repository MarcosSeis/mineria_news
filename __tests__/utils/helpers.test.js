import {
  parseFecha, formatearFecha, diasDesde, textoHace, ordenarPorFechaDesc,
  filtrarRecientes, eventosProximos, urlSegura
} from '@/utils/helpers'
import { AHORA, crearJob, crearEvento } from '../../test-utils/fixtures'

describe('parseFecha', () => {
  it.each([
    ['20250115', '2025-01-15'],
    ['2025-01-15', '2025-01-15'],
    ['2025-01-15T10:30:00', '2025-01-15'],
    ['20250115 10:00:00', '2025-01-15'],
    ['01/15/2025', '2025-01-15'],
    ['11/19/2025', '2025-11-19'],
    ['2/5/2025', '2025-02-05']
  ])('interpreta %s como fecha UTC', (entrada, esperado) => {
    expect(parseFecha(entrada).toISOString().slice(0, 10)).toBe(esperado)
  })

  it('rechaza MM/DD/YYYY con mes o día imposibles', () => {
    expect(parseFecha('13/45/2025')?.toISOString().slice(0, 10)).not.toBe('2025-13-45')
  })

  it('devuelve la misma fecha si recibe un Date válido', () => {
    const fecha = new Date('2025-02-01')
    expect(parseFecha(fecha)).toBe(fecha)
  })

  it('usa el constructor de Date cuando no es formato YYYYMMDD', () => {
    expect(parseFecha('Jan 5, 2025 00:00:00 UTC').toISOString()).toBe('2025-01-05T00:00:00.000Z')
  })

  it.each([[null], [undefined], [''], ['no es fecha'], [new Date('x')]])('devuelve null para %p', (valor) => {
    expect(parseFecha(valor)).toBeNull()
  })
})

describe('formatearFecha', () => {
  it('formatea en español', () => {
    expect(formatearFecha('20250115')).toMatch(/15 de enero de 2025/)
  })

  it('no se corre un día por zona horaria', () => {
    expect(formatearFecha('2025-03-01')).toMatch(/^01 de marzo de 2025$/)
  })

  it('devuelve cadena vacía si la fecha es inválida', () => {
    expect(formatearFecha('nada')).toBe('')
    expect(formatearFecha(undefined)).toBe('')
  })
})

describe('diasDesde', () => {
  it('cuenta días completos', () => {
    expect(diasDesde('20261001', AHORA)).toBe(5)
  })

  it('no devuelve negativos para fechas futuras', () => {
    expect(diasDesde('20271001', AHORA)).toBe(0)
  })

  it('devuelve null con fecha inválida', () => {
    expect(diasDesde('x', AHORA)).toBeNull()
  })

  it('usa la fecha actual por defecto', () => {
    expect(diasDesde(new Date(Date.now() - 3 * 86400000 - 1000))).toBe(3)
  })
})

describe('textoHace', () => {
  it.each([
    [null, ''], [undefined, ''], [0, 'Hoy'], [1, 'Hace 1 día'], [2, 'Hace 2 días'], [30, 'Hace 30 días']
  ])('%p -> "%s"', (dias, esperado) => {
    expect(textoHace(dias)).toBe(esperado)
  })
})

describe('ordenarPorFechaDesc', () => {
  const items = [
    { id: 1, date: '2026-01-01' },
    { id: 2, date: '2026-03-01' },
    { id: 3, date: 'invalida' },
    { id: 4, date: '2026-02-01' }
  ]

  it('ordena de más reciente a más antigua y deja las inválidas al final', () => {
    expect(ordenarPorFechaDesc(items).map(i => i.id)).toEqual([2, 4, 1, 3])
  })

  it('no muta el arreglo original', () => {
    const copia = [...items]
    ordenarPorFechaDesc(items)
    expect(items).toEqual(copia)
  })

  it('permite elegir otro campo', () => {
    const lista = [{ f: '2026-01-01' }, { f: '2026-05-01' }]
    expect(ordenarPorFechaDesc(lista, 'f')[0].f).toBe('2026-05-01')
  })
})

describe('filtrarRecientes', () => {
  it('conserva solo los trabajos dentro del límite de días', () => {
    const jobs = [crearJob(1, '20261001'), crearJob(2, '20260901'), crearJob(3, '20260908')]
    expect(filtrarRecientes(jobs, 28, AHORA).map(j => j.id)).toEqual([1, 3])
  })

  it('usa job.date si acf.fecha no existe y descarta fechas inválidas', () => {
    const jobs = [
      { id: 1, date: '2026-10-01', acf: {} },
      { id: 2, acf: { fecha: 'mala' } }
    ]
    expect(filtrarRecientes(jobs, 28, AHORA).map(j => j.id)).toEqual([1])
  })

  it('usa 28 días y la fecha actual por defecto', () => {
    expect(filtrarRecientes([crearJob(1, '20000101')])).toEqual([])
  })
})

describe('eventosProximos', () => {
  const eventos = [
    crearEvento(1, '20260101'),
    crearEvento(2, '20261220'),
    crearEvento(3, '20261110'),
    crearEvento(4, '20261201'),
    crearEvento(5, '20270101'),
    crearEvento(6, 'invalida')
  ]

  it('descarta pasados e inválidos, ordena ascendente y limita', () => {
    expect(eventosProximos(eventos, 3, AHORA).map(e => e.id)).toEqual([3, 4, 2])
  })

  it('devuelve los 3 más próximos aunque vengan desordenados (no 3 cualesquiera)', () => {
    const desordenados = [eventos[4], eventos[1], eventos[3], eventos[2]]
    expect(eventosProximos(desordenados, 2, AHORA).map(e => e.id)).toEqual([3, 4])
  })

  it('usa límite 3 por defecto', () => {
    expect(eventosProximos([crearEvento(9, '20990101')])).toHaveLength(1)
  })
})

describe('urlSegura', () => {
  it.each(['https://a.com', 'http://a.com/x?y=1'])('acepta %s', (url) => {
    expect(urlSegura(url)).toBe(url)
  })

  it.each(['javascript:alert(1)', 'data:text/html,hola', 'ftp://a.com', 'no es url', '', null, undefined, 42])(
    'rechaza %p', (url) => { expect(urlSegura(url)).toBeNull() }
  )
})
