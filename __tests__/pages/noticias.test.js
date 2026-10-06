import { render, screen, within } from '@testing-library/react'
import Noticias, { getStaticProps } from '@/pages/noticias'
import { fetchList } from '@/lib/api'
import { crearPost } from '../../test-utils/fixtures'

jest.mock('@/lib/api')
afterEach(() => jest.resetAllMocks())

describe('Noticias', () => {
  it('lista las noticias de la más reciente a la más antigua', () => {
    const posts = [crearPost(1, '2026-01-01'), crearPost(2, '2026-03-01'), crearPost(3, '2026-02-01')]
    render(<Noticias posts={posts} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Ultimas Noticias' })).toBeInTheDocument()
    expect(within(screen.getByRole('main')).getAllByRole('heading', { level: 3 }).map(h => h.textContent)).toEqual(['Noticia 2', 'Noticia 3', 'Noticia 1'])
  })

  it('renderiza vacío sin noticias', () => {
    render(<Noticias posts={[]} />)
    expect(screen.queryAllByRole('article')).toHaveLength(0)
  })

  it('getStaticProps usa la API y revalida', async () => {
    fetchList.mockResolvedValue([{ id: 1 }])
    expect(await getStaticProps()).toEqual({ props: { posts: [{ id: 1 }] }, revalidate: 10 })
    expect(fetchList).toHaveBeenCalledWith('noticia')
  })
})
