import { useState } from "react";
import Layout from "@/components/layout";
import Mina from "@/components/mina";
import styles from '@/styles/minas.module.css';
import { leerMinas } from "@/lib/minas";
import { CONTACT_EMAIL } from "@/lib/config";
import { filtrarMinas, listarEstados, listarMinerales, ordenarMinas } from "@/utils/minas";

export default function Minas({ minas }) {
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('')
  const [mineral, setMineral] = useState('')

  const visibles = ordenarMinas(filtrarMinas(minas, { busqueda, estado, mineral }))

  return (
    <>
    <Layout
        title={'Directorio de minas'}
        description={'Directorio de minas en México: ubicación, empresa, minerales y estatus de las principales operaciones mineras'}
    >
    <main>
      <h1>Directorio de minas</h1>
      <p className={styles.aviso}>
        Información referencial de fuentes públicas; la empresa y el estatus pueden cambiar.
        ¿Encontraste un error? Escríbenos a {CONTACT_EMAIL}.
      </p>

      <div className={styles.filtros}>
        <label>
          Buscar
          <input type="search" value={busqueda} placeholder="Mina, empresa o estado"
            onChange={e => setBusqueda(e.target.value)} />
        </label>
        <label>
          Estado
          <select value={estado} onChange={e => setEstado(e.target.value)}>
            <option value="">Todos</option>
            {listarEstados(minas).map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </label>
        <label>
          Mineral
          <select value={mineral} onChange={e => setMineral(e.target.value)}>
            <option value="">Todos</option>
            {listarMinerales(minas).map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
      </div>

      {minas.length === 0
        ? <p className={styles.vacio}>Todavía no hay minas en el directorio.</p>
        : <>
            <p className={styles.cuenta} aria-live="polite">
              {visibles.length} {visibles.length === 1 ? 'mina' : 'minas'}
            </p>
            {visibles.length === 0
              ? <p className={styles.vacio}>Ninguna mina coincide con la búsqueda.</p>
              : <div className={styles.grid}>
                  {visibles.map(mina => <Mina key={mina.id} mina={mina.acf} id={mina.slug} />)}
                </div>}
          </>}
    </main>
    </Layout>
    </>
  )
}

export function getStaticProps() {
  return { props: { minas: leerMinas() } }
}
