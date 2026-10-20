// Tiny store telling pages when the first-visit loader has finished, so hero
// choreography starts only once the page is actually visible.
let done = false
const listeners = new Set<() => void>()

export const intro = {
  isDone: () => done,
  finish() {
    if (done) return
    done = true
    listeners.forEach((l) => l())
    listeners.clear()
  },
  onDone(cb: () => void) {
    if (done) {
      cb()
      return () => {}
    }
    listeners.add(cb)
    return () => listeners.delete(cb)
  },
}
