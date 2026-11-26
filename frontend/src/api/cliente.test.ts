import { acordarApi } from './cliente'

describe('acordarApi', () => {
  it('chama o health check da API', () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"status":"UP"}'))

    acordarApi()

    expect(fetch).toHaveBeenCalledWith('/api/actuator/health')
  })

  it('não quebra a página se a API estiver fora do ar', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))

    expect(() => acordarApi()).not.toThrow()
    // Deixa a promessa rejeitada terminar: um erro não tratado faria o teste falhar.
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
})
