import { render, screen } from '@testing-library/react'
import Eventos, { getStaticProps } from '@/pages/eventos'
import { fetchList } from '@/lib/api'
import { crearEvento, congelarFecha, descongelarFecha } from '../../test-utils/fixtures'

jest.mock('@/lib/api')
beforeEach(() => congelarFecha())
afterEach(() => { descongelarFecha(); jest.resetAllMocks() })

describe('Eventos', () => {
  it('muestra el año actual y los eventos del mes en curso', () => {
    render(<Eventos eventos={[crearEvento(1, '20261012')]} />)
    expect(screen.getByRole('heading', { level: 1, name: /Próximos Eventos 2026/ })).toBeInTheDocument()
    expect(screen.getAllByText('Evento 1').length).toBeGreaterThan(0)
  })

  it('getStaticProps revalida cada hora para que no se quede viejo el calendario', async () => {
    fetchList.mockResolvedValue([{ id: 1 }])
    expect(await getStaticProps()).toEqual({ props: { eventos: [{ id: 1 }] }, revalidate: 3600 })
    expect(fetchList).toHaveBeenCalledWith('evento')
  })
})
