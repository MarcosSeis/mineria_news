import { renderHook, act } from '@testing-library/react'
import useCuentaAtras, { formatearCuentaAtras } from '@/hooks/useCuentaAtras'

describe('useCuentaAtras', () => {
  afterEach(() => jest.useRealTimers())

  it('formatea horas, minutos y segundos', () => {
    expect(formatearCuentaAtras(3723000)).toBe('01:02:03')
    expect(formatearCuentaAtras(-5)).toBe('00:00:00')
  })

  it('cuenta hasta la medianoche y avisa al terminar', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(2026, 5, 1, 23, 59, 55))
    const fin = jest.fn()
    const { result } = renderHook(() => useCuentaAtras(true, fin))
    expect(result.current).toBe('00:00:05')
    act(() => { jest.advanceTimersByTime(2000) })
    expect(result.current).toBe('00:00:03')
    expect(fin).not.toHaveBeenCalled()
    act(() => { jest.advanceTimersByTime(4000) })
    expect(fin).toHaveBeenCalled()
  })

  it('inactiva no calcula nada', () => {
    const { result } = renderHook(() => useCuentaAtras(false))
    expect(result.current).toBe('--:--:--')
  })
})
