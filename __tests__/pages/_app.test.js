import { render, screen } from '@testing-library/react'
import App from '@/pages/_app'

jest.mock('@vercel/analytics/react', () => ({
  Analytics: () => require('react').createElement('div', { 'data-testid': 'analytics' })
}))

describe('_app', () => {
  it('renderiza la página con sus props y el componente de analytics', () => {
    const Pagina = ({ saludo }) => <p>{saludo}</p>
    render(<App Component={Pagina} pageProps={{ saludo: 'hola' }} />)
    expect(screen.getByText('hola')).toBeInTheDocument()
    expect(screen.getByTestId('analytics')).toBeInTheDocument()
  })
})
