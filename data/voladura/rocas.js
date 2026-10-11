// Rocas del juego. "competencia" va de 1 (muy blanda) a 10 (muy competente).
// "paleta" son los colores pixel art de la cara del frente.
export const rocas = [
  { id: 'caliza', nombre: 'Caliza', competencia: 5, densidad: 2.6, paleta: ['#b9a98a', '#d2c4a6', '#8f7f63'], pista: 'Roca sedimentaria de dureza media, se rompe de forma pareja.' },
  { id: 'granito', nombre: 'Granito', competencia: 9, densidad: 2.7, paleta: ['#8b8f98', '#aab0ba', '#5f636c'], pista: 'Muy competente: pide energía y un diseño cerrado.' },
  { id: 'andesita', nombre: 'Andesita', competencia: 7, densidad: 2.65, paleta: ['#7a8570', '#98a58d', '#56604f'], pista: 'Volcánica y dura; responde bien a una buena carga de fondo.' },
  { id: 'basalto', nombre: 'Basalto', competencia: 8, densidad: 2.9, paleta: ['#5d6068', '#7a7e88', '#3a3c42'], pista: 'Densa y tenaz; no perdona un diseño tímido.' },
  { id: 'arenisca', nombre: 'Arenisca', competencia: 4, densidad: 2.4, paleta: ['#c79a62', '#e0b680', '#9b7240'], pista: 'Roca porosa y moderada; cuidado con pasarse de energía.' },
  { id: 'lutita', nombre: 'Lutita', competencia: 2, densidad: 2.5, paleta: ['#4f4a52', '#6b6570', '#33303a'], pista: 'Blanda y laminada: con poca energía ya cede.' },
  { id: 'skarn', nombre: 'Skarn', competencia: 7, densidad: 3.2, paleta: ['#8b5a4a', '#ad7a66', '#5e3a30'], pista: 'Densa, con mineralización; aguanta y devuelve energía.' },
  { id: 'porfido', nombre: 'Pórfido cuprífero', competencia: 6, densidad: 2.6, paleta: ['#6f8a82', '#8fb0a6', '#496059'], pista: 'Alterada y variable: nunca se comporta igual dos veces.' },
  { id: 'cuarcita', nombre: 'Cuarcita', competencia: 10, densidad: 2.65, paleta: ['#a8a2a8', '#cbc6cb', '#78737a'], pista: 'La más dura de la casa: o la rompes bien o no se mueve.' },
  { id: 'esquisto', nombre: 'Esquisto', competencia: 3, densidad: 2.7, paleta: ['#6a6f5a', '#8a9076', '#454a38'], pista: 'Foliado y blando: rompe por donde quiere.' }
]

export function etiquetaCompetencia(competencia) {
  if (competencia <= 3) return 'Blanda'
  if (competencia <= 5) return 'Media'
  if (competencia <= 7) return 'Dura'
  return 'Muy dura'
}
