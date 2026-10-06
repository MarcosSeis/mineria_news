import axios from 'axios'
import { fetchList, fetchBySlug, getApiUrl } from '@/lib/api'

jest.mock('axios')

const entornoOriginal = { ...process.env }

beforeEach(() => {
  jest.resetAllMocks()
  process.env = { ...entornoOriginal, API_URL: 'https://api.test/wp', NEXT_PUBLIC_API_URL: '' }
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterAll(() => {
  process.env = entornoOriginal
})

describe('getApiUrl', () => {
  it('prefiere API_URL', () => {
    expect(getApiUrl()).toBe('https://api.test/wp')
  })

  it('cae a NEXT_PUBLIC_API_URL por compatibilidad', () => {
    delete process.env.API_URL
    process.env.NEXT_PUBLIC_API_URL = 'https://viejo.test'
    expect(getApiUrl()).toBe('https://viejo.test')
  })

  it('devuelve cadena vacía sin configuración', () => {
    delete process.env.API_URL
    process.env.NEXT_PUBLIC_API_URL = ''
    expect(getApiUrl()).toBe('')
  })
})

describe('fetchList', () => {
  it('devuelve los datos de la API', async () => {
    axios.get.mockResolvedValue({ data: [{ id: 1 }] })
    await expect(fetchList('noticia')).resolves.toEqual([{ id: 1 }])
    expect(axios.get).toHaveBeenCalledWith('https://api.test/wp/noticia')
  })

  it('devuelve [] si la respuesta no es un arreglo', async () => {
    axios.get.mockResolvedValue({ data: { code: 'rest_no_route' } })
    await expect(fetchList('noticia')).resolves.toEqual([])
  })

  it('devuelve [] y registra el error si la API falla', async () => {
    axios.get.mockRejectedValue(new Error('getaddrinfo ENOTFOUND'))
    await expect(fetchList('job')).resolves.toEqual([])
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('ENOTFOUND'))
  })
})

describe('fetchBySlug', () => {
  it('devuelve el primer resultado y envía el slug como parámetro', async () => {
    axios.get.mockResolvedValue({ data: [{ id: 7 }, { id: 8 }] })
    await expect(fetchBySlug('noticia', 'mi-slug')).resolves.toEqual({ id: 7 })
    expect(axios.get).toHaveBeenCalledWith('https://api.test/wp/noticia', { params: { slug: 'mi-slug' } })
  })

  it('devuelve null si no hay coincidencias', async () => {
    axios.get.mockResolvedValue({ data: [] })
    await expect(fetchBySlug('noticia', 'x')).resolves.toBeNull()
  })

  it('devuelve null si la respuesta no es un arreglo', async () => {
    axios.get.mockResolvedValue({ data: null })
    await expect(fetchBySlug('noticia', 'x')).resolves.toBeNull()
  })

  it('devuelve null y registra el error si la API falla', async () => {
    axios.get.mockRejectedValue(new Error('timeout'))
    await expect(fetchBySlug('job', 'x')).resolves.toBeNull()
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('timeout'))
  })
})
