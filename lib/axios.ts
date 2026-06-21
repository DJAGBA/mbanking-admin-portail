import axios from 'axios'
import {getToken, removeToken, isTokenExpired} from './tokenUtils'

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 50000,
})
const redirectToLogin = () => {
    if (globalThis.window?.location.pathname !== '/login') {
        globalThis.window.location.href = '/login'
    }
}
// Add JWT token to requests
api.interceptors.request.use((config) => {
    const token = getToken()

    if (token) {
        if (isTokenExpired(token)) {
            removeToken()
            redirectToLogin()
            return Promise.reject(new Error('Token expired'))
        }
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})
// Handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log(JSON.stringify(error))
        const code = error.response?.data?.status?.code
        const message = error.response?.data?.status?.message
        const description = error.response?.data?.status?.description

        switch (code) {

            case 4000:

                return Promise.reject(new Error(description || message || 'Données invalides'))
            case 4010:
                removeToken()
                redirectToLogin()
                return Promise.reject(new Error('Session invalide. Veuillez vous reconnecter.'))

            case 4011:
                removeToken()
                redirectToLogin()
                return Promise.reject(new Error('Session expirée. Veuillez vous reconnecter.'))

            case 4012:
                removeToken()
                redirectToLogin()
                return Promise.reject(new Error('Session invalide. Veuillez vous reconnecter.'))

            case 4040:
                return Promise.reject(new Error(description || message || 'Ressource introuvable'))

            case 4090:
                return Promise.reject(new Error(description || message || 'Cette ressource existe déjà'))

            case 4220:
                return Promise.reject(new Error(description || message || 'Opération non autorisée'))

            case 5000:
                return Promise.reject(new Error('Erreur serveur. Veuillez réessayer plus tard.'))

            default:
                if (!error.response) {
                    // Log detailed info for debugging network issues (temporary)
                    console.error('Network error: ', {
                        message: error.message,
                        request: error.request,
                    });
                    return Promise.reject(new Error(error.message || 'Erreur réseau. Vérifiez votre connexion.'))
                }
                return Promise.reject(new Error(description || message || 'Une erreur est survenue'))
        }
    }
)

export default api