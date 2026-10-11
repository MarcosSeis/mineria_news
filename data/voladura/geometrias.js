// Geometrías del escenario subterráneo. "muro" es la fracción de la altura que ocupa el
// hastial recto; el resto es la bóveda en arco.
export const geometriasSubterraneas = [
  { id: 'frente', nombre: 'Frente de túnel', ancho: 4.2, alto: 4.0, muro: 0.6 },
  { id: 'galeria', nombre: 'Galería', ancho: 3.6, alto: 3.4, muro: 0.65 },
  { id: 'crucero', nombre: 'Crucero', ancho: 5.0, alto: 4.4, muro: 0.7 },
  { id: 'desarrollo', nombre: 'Desarrollo de rampa', ancho: 4.8, alto: 4.6, muro: 0.6 }
]

export const zonas = ['Norte', 'Sur', 'Este', 'Oeste', 'Central', 'Profundo', 'Alto', 'Bajo']
