import { leerMinas, leerMina } from '@/lib/minas'

describe('data/minas.json', () => {
  const minas = leerMinas()

  it('tiene minas con id y slug únicos', () => {
    expect(minas.length).toBeGreaterThan(0)
    expect(new Set(minas.map(m => m.id)).size).toBe(minas.length)
    expect(new Set(minas.map(m => m.slug)).size).toBe(minas.length)
  })

  it.each(minas.map(m => [m.slug, m]))('%s tiene contacto con formato válido', (_, { acf }) => {
    if (acf.sitio_web) expect(acf.sitio_web).toMatch(/^https:\/\/[^\s]+$/)
    if (acf.correo) expect(acf.correo).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    if (acf.telefono) expect(acf.telefono.replace(/\D/g, '').length).toBeGreaterThanOrEqual(10)
  })

  it.each(minas.map(m => [m.slug, m]))('%s tiene los campos mínimos', (_, mina) => {
    expect(mina.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    expect(mina.acf.titulo).toBeTruthy()
    expect(mina.acf.estado).toBeTruthy()
    expect(mina.acf.minerales).toBeTruthy()
  })
})

describe('leerMina', () => {
  it('encuentra una mina por slug', () => {
    expect(leerMina('penasquito').acf.titulo).toBe('Peñasquito')
  })

  it('devuelve null si no existe', () => {
    expect(leerMina('no-existe')).toBeNull()
  })
})
