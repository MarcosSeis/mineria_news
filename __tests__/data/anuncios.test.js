import { anuncios } from '@/data/anuncios'
import { urlSegura } from '@/utils/helpers'
import { CONTACT_EMAIL, SITE_NAME } from '@/lib/config'
import fs from 'fs'
import path from 'path'

describe('anuncios', () => {
  it.each(anuncios)('$alt tiene enlace seguro, texto alternativo e imagen existente', ({ ruta, link, alt }) => {
    expect(urlSegura(link)).toBe(link)
    expect(alt).toBeTruthy()
    expect(fs.existsSync(path.join(process.cwd(), 'public', ruta))).toBe(true)
  })

  it('no repite enlaces', () => {
    expect(new Set(anuncios.map(a => a.link)).size).toBe(anuncios.length)
  })
})

describe('config', () => {
  it('expone contacto y nombre del sitio', () => {
    expect(CONTACT_EMAIL).toMatch(/@/)
    expect(SITE_NAME).toBe('Minería News')
  })
})
