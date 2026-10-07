import { separarMinerales, listarEstados, listarMinerales, ordenarMinas, filtrarMinas } from '@/utils/minas'
import { crearMina } from '../../test-utils/fixtures'

const minas = [
  crearMina(1, { titulo: 'Peñasquito', estado: 'Zacatecas', empresa: 'Newmont', minerales: 'Oro, Plata, Plomo' }),
  crearMina(2, { titulo: 'Cananea', estado: 'Sonora', empresa: 'Grupo México', minerales: 'Cobre' }),
  crearMina(3, { titulo: 'La Herradura', estado: 'Sonora', empresa: 'Fresnillo plc', minerales: 'oro' })
]

describe('separarMinerales', () => {
  it('separa por coma o punto y coma y recorta espacios', () => {
    expect(separarMinerales('Oro, Plata; Cobre ')).toEqual(['Oro', 'Plata', 'Cobre'])
  })

  it.each([undefined, null, '', ' , '])('devuelve [] con %p', (valor) => {
    expect(separarMinerales(valor)).toEqual([])
  })
})

describe('listarEstados / listarMinerales', () => {
  it('devuelven valores únicos, sin distinguir mayúsculas, ordenados', () => {
    expect(listarEstados(minas)).toEqual(['Sonora', 'Zacatecas'])
    expect(listarMinerales(minas)).toEqual(['Cobre', 'Oro', 'Plata', 'Plomo'])
  })

  it('toleran minas sin campos', () => {
    expect(listarEstados([{ id: 1 }])).toEqual([])
    expect(listarMinerales([{ id: 1, acf: {} }])).toEqual([])
  })
})

describe('ordenarMinas', () => {
  it('ordena alfabéticamente sin mutar la lista', () => {
    const copia = [...minas]
    expect(ordenarMinas(minas).map(m => m.acf.titulo)).toEqual(['Cananea', 'La Herradura', 'Peñasquito'])
    expect(minas).toEqual(copia)
  })
})

describe('filtrarMinas', () => {
  const nombres = (filtros) => filtrarMinas(minas, filtros).map(m => m.acf.titulo)

  it('sin filtros devuelve todas', () => {
    expect(nombres()).toHaveLength(3)
  })

  it('filtra por estado y por mineral (sin distinguir mayúsculas)', () => {
    expect(nombres({ estado: 'sonora' })).toEqual(['Cananea', 'La Herradura'])
    expect(nombres({ mineral: 'ORO' })).toEqual(['Peñasquito', 'La Herradura'])
  })

  it('la búsqueda ignora acentos y mira nombre, empresa y estado', () => {
    expect(nombres({ busqueda: 'penasquito' })).toEqual(['Peñasquito'])
    expect(nombres({ busqueda: 'grupo mexico' })).toEqual(['Cananea'])
    expect(nombres({ busqueda: 'zacatecas' })).toEqual(['Peñasquito'])
  })

  it('combina filtros', () => {
    expect(nombres({ estado: 'Sonora', mineral: 'Oro' })).toEqual(['La Herradura'])
    expect(nombres({ estado: 'Zacatecas', mineral: 'Cobre' })).toEqual([])
  })
})
