// Sprites pixel art hechos a mano. Cada letra es un color de "mapa"; '.' es transparente.
const mapa = {
  K: '#14110f', Y: '#f2c200', O: '#f26a1b', W: '#f4f4f0', S: '#e0a878', B: '#2f4a73',
  G: '#8a8f99', g: '#4d525c', R: '#d63a2f', C: '#3fb4c9', N: '#7a4a24', X: '#f7e08a'
}

const sprite = (filas) => ({ filas, mapa })

export const minero = sprite([
  '..YYYY..',
  '.YYYYYY.',
  '..SSSS..',
  '..SKSK..',
  '..SSSS..',
  '.OOOOOO.',
  'SOWOOWOS',
  '.OOOOOO.',
  '..BBBB..',
  '..B..B..',
  '..B..B..',
  '.KK..KK.'
])

export const lampara = sprite([
  '..K..',
  '..K..',
  '.KKK.',
  'KYYYK',
  'KYWYK',
  '.KYK.'
])

export const senal = sprite([
  '.....K.....',
  '....KYK....',
  '....KYK....',
  '...KYKYK...',
  '...KYKYK...',
  '..KYYKYYK..',
  '..KYYYYYK..',
  '.KYYYKYYYK.',
  'KKKKKKKKKKK'
])

export const jumbo = sprite([
  '..............KK..',
  '.............KGK..',
  '............KGK...',
  '...KKKKKK..KGK....',
  '..KYYYYYYKKGK.....',
  '..KYWWYYYYGK......',
  '..KYWWYYYYYK......',
  '..KYYYYYYYYK......',
  '.KKKKKKKKKKKK.....',
  'KgGgGgGgGgGgGK....',
  'KgKgKgKgKgKgKK....',
  '.KKKKKKKKKKKK.....'
])

// Iconos de 8×8 para los eventos.
export const iconos = {
  taladro: sprite(['...KKK..', '..KYYYK.', '.KYYYYK.', '.KYYYYKG', '..KKKKGG', '....KGG.', '...KGG..', '..KG....']),
  barreno: sprite(['........', '.GGGGGG.', '.GKKKKG.', '.GKYYKG.', '.GKYYKG.', '.GKKKKG.', '.GGGGGG.', '........']),
  bomba: sprite(['..GGGG..', '.GCCCCG.', '.GCWWCG.', '.GCCCCG.', '..GGGG..', '...GG...', '.GGGGGG.', '.KKKKKK.']),
  reloj: sprite(['..KKKK..', '.KWWWWK.', 'KWWKWWWK', 'KWWKWWWK', 'KWWKKWWK', 'KWWWWWWK', '.KWWWWK.', '..KKKK..']),
  caja: sprite(['........', '.NNNNNN.', 'NXXXXXXN', 'NXNNNNXN', 'NXXXXXXN', 'NNNNNNNN', 'NNNNNNNN', 'KKKKKKKK']),
  agua: sprite(['...CC...', '...CC...', '..CCCC..', '.CCWCCC.', '.CCWCCC.', '.CCCCCC.', '..CCCC..', '........']),
  lluvia: sprite(['..GGG...', '.GGGGGG.', 'GGGGGGGG', '.gggggg.', '.C..C..C', '..C..C..', '.C..C..C', '........']),
  chispa: sprite(['...Y....', '...Y..Y.', '.Y.YO.Y.', '..YOOY..', 'YYOWWOYY', '..YOOY..', '.Y.YO.Y.', '...Y....']),
  roca: sprite(['........', '..GGG...', '.GWWGG..', 'GWWGGgG.', 'GGGGgggG', 'gGGgggGg', '.ggggGg.', '..gggg..']),
  fractura: sprite(['GGGGGGGG', 'GGGgGGGG', 'GGgGGGGG', 'GgGGGgGG', 'GGGGgGGG', 'GGGgGGGG', 'GGgGGgGG', 'GGGGGGGG']),
  papel: sprite(['.WWWWW..', '.WKKKW..', '.WWWWWW.', '.WKKKKW.', '.WWWWWW.', '.WKKKW..', '.WWWWW..', '........']),
  gema: sprite(['........', '..CCCC..', '.CWCCCC.', 'CWCCCCCC', '.CCCCCC.', '..CCCC..', '...CC...', '........'])
}
