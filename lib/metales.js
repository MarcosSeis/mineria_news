import datos from '@/data/metales.json'

// Los datos los mantiene scripts/actualizar-metales.mjs (una vez al día); aquí solo se leen.
export const leerActualizacion = () => datos.actualizado

// Precios del día, sin la serie histórica (para el home).
export const leerPrecios = () => datos.metales.map(({ serie, ...metal }) => metal)

// Precios del día con su serie histórica (para la gráfica).
export const leerMetalesConHistorico = () => datos.metales

export const formatearPrecio = (precio) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(precio)
