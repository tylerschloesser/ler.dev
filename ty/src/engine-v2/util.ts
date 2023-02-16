export function preventScroll(signal: AbortSignal) {
  document.body.style.overflow = 'hidden'
  signal.addEventListener('abort', () => {
    document.body.style.overflow = ''
  })
}

export function updateSize(container: HTMLElement, canvas: HTMLCanvasElement) {
  const rect = container.getBoundingClientRect()
  canvas.width = rect.width
  canvas.style.width = `${rect.width}px`
  canvas.height = rect.height
  canvas.style.height = `${rect.height}px`
}
