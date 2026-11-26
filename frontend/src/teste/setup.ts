import '@testing-library/jest-dom/vitest'

afterEach(() => {
  sessionStorage.clear()
  vi.restoreAllMocks()
})

// O jsdom não implementa a rolagem da janela.
window.scrollTo = () => {}
