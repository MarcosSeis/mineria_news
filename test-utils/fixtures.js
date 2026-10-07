export const AHORA = new Date('2026-10-06T12:00:00Z')

// Congela solo Date (el resto de los timers siguen reales para no romper user-event ni waitFor)
export const congelarFecha = (fecha = AHORA) =>
  jest.useFakeTimers({
    now: fecha,
    doNotFake: [
      'nextTick', 'setImmediate', 'clearImmediate', 'setInterval', 'clearInterval',
      'setTimeout', 'clearTimeout', 'queueMicrotask', 'requestAnimationFrame',
      'cancelAnimationFrame', 'requestIdleCallback', 'cancelIdleCallback', 'performance'
    ]
  })

export const descongelarFecha = () => jest.useRealTimers()

export const crearPost = (id, date = '2026-10-01T10:00:00', acf = {}) => ({
  id,
  slug: `noticia-${id}`,
  date,
  acf: {
    titulo: `Noticia ${id}`,
    contenido: `Resumen ${id}`,
    imagen: `https://res.cloudinary.com/demo/noticia-${id}.jpg`,
    ...acf
  }
})

export const crearJob = (id, fecha, acf = {}) => ({
  id,
  slug: `trabajo-${id}`,
  date: `${fecha.slice(0, 4)}-${fecha.slice(4, 6)}-${fecha.slice(6, 8)}T10:00:00`,
  acf: {
    titulo: `Trabajo ${id}`,
    requisitos: `Requisitos ${id}`,
    fecha,
    sueldo: '$30,000',
    empresa: `Empresa ${id}`,
    ubicacion: 'Zacatecas',
    link: 'https://empresa.test/oferta',
    ...acf
  }
})

export const crearEvento = (id, fecha_ini, fecha_fin = fecha_ini, acf = {}) => ({
  id,
  slug: `evento-${id}`,
  acf: {
    titulo: `Evento ${id}`,
    horario: '9:00 - 18:00',
    imagen: `https://res.cloudinary.com/demo/evento-${id}.jpg`,
    detalles: `Detalles ${id}`,
    ubicacion: 'Acapulco',
    pagina_evento: `https://evento${id}.test/`,
    calendario_google: `https://calendar.test/${id}`,
    fecha_ini,
    fecha_fin,
    ...acf
  }
})

export const crearProveedor = (id, date = '2026-09-01T10:00:00', acf = {}) => ({
  id,
  date,
  acf: {
    nombre: `Proveedor ${id}`,
    web: `https://proveedor${id}.test`,
    telefono: '555-0000',
    correo: `contacto${id}@proveedor.test`,
    direccion: 'Calle 1, CDMX',
    logo: `https://minasapi.space/logo-${id}.png`,
    ...acf
  }
})

export const crearMina = (id, acf = {}) => ({
  id,
  slug: `mina-${id}`,
  acf: {
    titulo: `Mina ${id}`,
    estado: 'Zacatecas',
    empresa: `Empresa ${id}`,
    minerales: 'Oro, Plata',
    tipo: 'Subterránea',
    estatus: 'En operación',
    descripcion: `Descripción ${id}`,
    imagen: `https://minasapi.space/mina-${id}.jpg`,
    sitio_web: `https://mina${id}.test/`,
    ...acf
  }
})
