import { ref, onMounted, onUnmounted } from 'vue'
import { onAuthStateChanged, type User } from 'firebase/auth'

export const useAuth = () => {
    const { $firebase } = useNuxtApp()
    const user = ref<User | null>(null)
    const loading = ref(true)
    let unsubscribe: (() => void) | null = null

    onMounted(() => {
        if ($firebase.auth) {
            unsubscribe = onAuthStateChanged($firebase.auth, (u) => {
                user.value = u
                loading.value = false
            })
        }
    })

    onUnmounted(() => {
        if (unsubscribe) {
            unsubscribe()
        }
    })

    return {
        user,
        loading,
        isAuthenticated: computed(() => !!user.value)
    }
}