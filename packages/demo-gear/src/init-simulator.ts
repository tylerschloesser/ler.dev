import { TICK_DURATION } from './const.js'
import { tick } from './tick.js'
import { InitFn } from './types.js'

export const initSimulator: InitFn = async (state) => {
  let prev: number = performance.now()

  const interval = self.setInterval(() => {
    const now = performance.now()

    // cap the tick at 2x the duration
    // elapsed will likely be > TICK_DURATION because
    // of setInterval accuracy
    //
    if (now - prev > TICK_DURATION * 2) {
      prev = now - TICK_DURATION * 2
    }

    const elapsed = (now - prev) / 1000
    prev = now

    try {
      tick(state, elapsed)

      for (const listener of state.tickListeners) {
        listener(state)
      }
    } catch (e) {
      console.error(e)
      self.clearInterval(interval)
      self.alert('Gears broke ☹️. Refresh to try again...')
    }
  }, TICK_DURATION)

  state.signal.addEventListener('abort', () => {
    self.clearInterval(interval)
  })
}
