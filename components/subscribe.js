import { useState } from 'react'
import axios from 'axios'
import styles from "@/styles/subscribe.module.css"

function Subscribe() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle')
  const [errorMsg, setErrorMsg] = useState(null)

  const subscribe = async (e) => {
    e.preventDefault()

    setState('Loading')

    try {
      const response = await axios.post('/api/subscribe', { email })
      setState('Success')
      setEmail('')
    } catch (e) {
      setErrorMsg(e.response.data.error)
      setState('Error')
    }
  }

  return (
    <div className={styles.subscribeContainer}>
      <h4 className={styles.sub_header}>Suscríbete a nuestro boletin semanal</h4>
      <p className={styles.sub_text}>
        No te pierdas las noticias mas destacadas de la semana en la mineria. Te enviaremos un email a la semana, no spam.
      </p>
      <form onSubmit={subscribe}>
        <div className={styles.subFormContainer}>
          <div className={styles.form_input}>
            <input
              required
              id="email-input"
              name="email"
              type="email"
              placeholder="Tu correo electronico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.sub_form_btn}>
            <button
              disabled={state === 'Loading'}
              type="submit"
              className={styles.form_btn}
              onClick={subscribe}
            >
              Suscríbete
            </button>
          </div>
        </div>
        {state === 'Error' && (
          <div className={styles.errorState}>{errorMsg}</div>
        )}
        {state === 'Success' && (
          <div className={styles.successState}>¡Fantastico, quedaste suscrito!</div>
        )}
      </form>
      </div>
  )
}

export default Subscribe