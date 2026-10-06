import '@testing-library/jest-dom'

// next/image se reemplaza por un <img> simple: evita la configuración de dominios y el loader en pruebas
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, className }) =>
    require('react').createElement('img', {
      src: typeof src === 'object' ? src.src : src,
      alt,
      width,
      height,
      className
    })
}))

// next/head no pinta en el DOM durante las pruebas; se renderiza en línea para poder inspeccionarlo
jest.mock('next/head', () => ({
  __esModule: true,
  default: ({ children }) => require('react').createElement(require('react').Fragment, null, children)
}))
