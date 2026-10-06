import { render, screen } from '@testing-library/react'
import Footer from '@/components/footer'

describe('Footer', () => {
  it('muestra marca, contacto y descripción sin añadir un h1', () => {
    render(<Footer />)
    expect(screen.getByText('© MINERÍA NEWS')).toBeInTheDocument()
    expect(screen.getByText(/Contacto: infominerianews@gmail.com/)).toBeInTheDocument()
    expect(screen.getByText(/medio independiente/)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })
})
