// Helpers del directorio de minas. Los datos llegan de WordPress (tipo "mina", campos ACF).

const normalizar = (texto) =>
    String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

// "Oro, Plata; Cobre" -> ['Oro', 'Plata', 'Cobre']
export const separarMinerales = (texto) =>
    String(texto ?? '').split(/[,;]/).map(m => m.trim()).filter(Boolean)

// Quita duplicados sin distinguir mayúsculas ni acentos; conserva la primera variante vista.
const unicosOrdenados = (valores) => {
    const porClave = new Map()
    valores.forEach(v => { if (!porClave.has(normalizar(v))) porClave.set(normalizar(v), v) })
    return [...porClave.values()].sort((a, b) => a.localeCompare(b, 'es'))
}

export const listarEstados = (minas) =>
    unicosOrdenados(minas.map(m => m.acf?.estado?.trim()).filter(Boolean))

export const listarMinerales = (minas) =>
    unicosOrdenados(minas.flatMap(m => separarMinerales(m.acf?.minerales)))

export const ordenarMinas = (minas) =>
    [...minas].sort((a, b) => (a.acf?.titulo ?? '').localeCompare(b.acf?.titulo ?? '', 'es'))

// Filtros combinables; la búsqueda ignora mayúsculas y acentos y mira nombre, empresa y estado.
export const filtrarMinas = (minas, { busqueda = '', estado = '', mineral = '' } = {}) => {
    const texto = normalizar(busqueda)
    return minas.filter(({ acf = {} }) => {
        if (estado && normalizar(acf.estado) !== normalizar(estado)) return false
        if (mineral && !separarMinerales(acf.minerales).some(m => normalizar(m) === normalizar(mineral))) return false
        if (!texto) return true
        return [acf.titulo, acf.empresa, acf.estado].some(campo => normalizar(campo).includes(texto))
    })
}
