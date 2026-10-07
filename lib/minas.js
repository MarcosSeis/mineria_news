import minas from '@/data/minas.json'

// Por ahora los datos viven en data/minas.json con la misma forma que devolvería WordPress
// ({ id, slug, acf }), para migrarlos después cambiando solo estas dos funciones.
export const leerMinas = () => minas

export const leerMina = (slug) => minas.find(m => m.slug === slug) ?? null
