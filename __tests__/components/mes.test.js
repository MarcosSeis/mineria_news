import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Mes from '@/components/mes'

describe('Mes', () => {
  it('es un botón que notifica su id al hacer clic (también enero = 0)', async () => {
    const onClick = jest.fn()
    render(<Mes mes="Enero" id={0} actual={5} onClick={onClick} />)
    await userEvent.click(screen.getByRole('button', { name: 'Enero' }))
    expect(onClick).toHaveBeenCalledWith(0)
  })

  it('marca el mes actual con aria-pressed y clase', () => {
    const { rerender } = render(<Mes mes="Mayo" id={4} actual={4} onClick={() => {}} />)
    const boton = screen.getByRole('button')
    expect(boton).toHaveAttribute('aria-pressed', 'true')
    expect(boton).toHaveClass('actual')
    rerender(<Mes mes="Mayo" id={4} actual={2} onClick={() => {}} />)
    expect(boton).toHaveAttribute('aria-pressed', 'false')
    expect(boton).not.toHaveClass('actual')
  })
})
