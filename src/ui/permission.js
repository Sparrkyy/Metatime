const DEFAULT_LAT = 40.7128
const DEFAULT_LNG = -74.006
const DEFAULT_LABEL = 'New York City'

/**
 * Shows the permission screen and returns a promise that resolves with { lat, lng, label }.
 * The promise resolves when the user clicks either location button.
 */
export function requestLocation() {
  return new Promise((resolve) => {
    const screen = document.getElementById('permission-screen')
    const btnLocation = document.getElementById('btn-location')
    const btnDefault = document.getElementById('btn-default')

    btnLocation.addEventListener('click', () => {
      btnLocation.textContent = 'Requesting…'
      btnLocation.disabled = true

      if (!navigator.geolocation) {
        resolveWithDefault(screen, resolve)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          hideScreen(screen)
          resolve({
            lat: latitude,
            lng: longitude,
            label: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
          })
        },
        () => {
          // Denied or error → fall back silently
          resolveWithDefault(screen, resolve)
        },
        { timeout: 10000 }
      )
    })

    btnDefault.addEventListener('click', () => {
      resolveWithDefault(screen, resolve)
    })
  })
}

function resolveWithDefault(screen, resolve) {
  hideScreen(screen)
  resolve({ lat: DEFAULT_LAT, lng: DEFAULT_LNG, label: DEFAULT_LABEL })
}

function hideScreen(screen) {
  screen.style.transition = 'opacity 0.5s ease'
  screen.style.opacity = '0'
  setTimeout(() => {
    screen.style.display = 'none'
  }, 500)
}
