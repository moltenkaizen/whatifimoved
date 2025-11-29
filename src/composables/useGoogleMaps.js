import { ref } from 'vue'

const isLoaded = ref(false)
const isLoading = ref(false)
const loadError = ref(null)

export function useGoogleMaps() {
  const loadGoogleMaps = () => {
    return new Promise((resolve, reject) => {
      // If already loaded, resolve immediately
      if (isLoaded.value) {
        resolve(window.google)
        return
      }

      // If currently loading, wait for it
      if (isLoading.value) {
        const checkLoaded = setInterval(() => {
          if (isLoaded.value) {
            clearInterval(checkLoaded)
            resolve(window.google)
          } else if (loadError.value) {
            clearInterval(checkLoaded)
            reject(loadError.value)
          }
        }, 100)
        return
      }

      isLoading.value = true

      // Get API key from environment
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        const error = new Error('Google Maps API key not configured. Please add your API key to the .env file.')
        loadError.value = error
        isLoading.value = false
        reject(error)
        return
      }

      // Create and load script
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true

      script.onload = () => {
        isLoaded.value = true
        isLoading.value = false
        resolve(window.google)
      }

      script.onerror = () => {
        const error = new Error('Failed to load Google Maps API')
        loadError.value = error
        isLoading.value = false
        reject(error)
      }

      document.head.appendChild(script)
    })
  }

  return {
    loadGoogleMaps,
    isLoaded,
    isLoading,
    loadError
  }
}
