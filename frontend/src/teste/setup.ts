import '@testing-library/jest-dom/vitest'

// O jsdom ainda não implementa os métodos do <dialog>.
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.setAttribute('open', '')
}
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
  this.removeAttribute('open')
  this.dispatchEvent(new Event('close'))
}

afterEach(() => {
  sessionStorage.clear()
  vi.restoreAllMocks()
})
