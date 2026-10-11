// Explosivos del juego: abstracciones y nombres de fantasía, NO recomendaciones reales.
// energia: fuerza relativa; agua: 0 (se arruina) a 1 (inmune); costoKg: costo relativo.
export const explosivos = [
  { id: 'anfo', nombre: 'ANFO', energia: 1.0, densidad: 0.85, agua: 0, costoKg: 1.0, descripcion: 'El de siempre: rinde y es barato, pero el agua es su enemiga.' },
  { id: 'emulsion', nombre: 'Emulsión', energia: 1.15, densidad: 1.15, agua: 1, costoKg: 1.5, descripcion: 'Aguanta la humedad y rinde bien en roca dura.' },
  { id: 'gel', nombre: 'Gel Pixelita', energia: 1.3, densidad: 1.2, agua: 1, costoKg: 2.4, descripcion: 'Explosivo de fantasía, muy potente y muy caro.' },
  { id: 'eco', nombre: 'Eco-Mix', energia: 0.85, densidad: 0.8, agua: 0.5, costoKg: 1.6, descripcion: 'Suave y de bajo impacto, ideal para roca blanda o fracturada.' }
]

export const distribuciones = [
  { id: 'fondo', nombre: 'Carga de fondo', energia: 0.95, descripcion: 'Carga concentrada en el fondo del barreno.' },
  { id: 'columna', nombre: 'Columna completa', energia: 1.0, descripcion: 'Carga continua: máxima energía para roca dura.' },
  { id: 'desacoplada', nombre: 'Desacoplada', energia: 0.85, descripcion: 'Carga más suave y mejor control del contorno.' }
]

// Distancia entre distribuciones al evaluar el ajuste (ordenadas de menor a mayor energía).
export const ordenDistribucion = ['desacoplada', 'fondo', 'columna']
