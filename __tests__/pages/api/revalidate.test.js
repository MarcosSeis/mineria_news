/** @jest-environment node */
import handler, { rutasParaRevalidar } from '@/pages/api/revalidate'

const crearRes = () => {
  const res = { headers: {} }
  res.status = jest.fn(() => res)
  res.json = jest.fn(() => res)
  res.setHeader = jest.fn((k, v) => { res.headers[k] = v })
  res.revalidate = jest.fn(() => Promise.resolve())
  return res
}

const req = (body = {}, secreto = 'shh', method = 'POST') =>
  ({ method, body, headers: secreto ? { 'x-revalidate-secret': secreto } : {} })

beforeEach(() => { process.env.REVALIDATE_SECRET = 'shh' })
afterEach(() => { delete process.env.REVALIDATE_SECRET })

describe('/api/revalidate', () => {
  it('regenera portada, listado y la noticia', async () => {
    const res = crearRes()
    await handler(req({ slug: 'discovery-cordero' }), res)
    expect(res.revalidate.mock.calls.map(([r]) => r)).toEqual(['/', '/noticias', '/noticias/discovery-cordero'])
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('sin slug regenera solo portada y listado', () => {
    expect(rutasParaRevalidar()).toEqual(['/', '/noticias'])
  })

  it.each([
    ['secreto incorrecto', req({}, 'otro'), 401],
    ['sin secreto', req({}, null), 401],
    ['método GET', req({}, 'shh', 'GET'), 405],
    ['slug con ruta', req({ slug: '../admin' }), 400],
  ])('rechaza %s', async (_, peticion, codigo) => {
    const res = crearRes()
    await handler(peticion, res)
    expect(res.status).toHaveBeenCalledWith(codigo)
    expect(res.revalidate).not.toHaveBeenCalled()
  })

  it('rechaza todo si no hay REVALIDATE_SECRET configurado', async () => {
    delete process.env.REVALIDATE_SECRET
    const res = crearRes()
    await handler(req({}, 'undefined'), res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('responde 500 si falla la regeneración', async () => {
    const res = crearRes()
    res.revalidate.mockRejectedValueOnce(new Error('boom'))
    jest.spyOn(console, 'error').mockImplementation(() => {})
    await handler(req({ slug: 'x' }), res)
    expect(res.status).toHaveBeenCalledWith(500)
  })
})
