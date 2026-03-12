<template>
    <div class="min-h-[80vh] flex items-center justify-center bg-gray-50">
        <div class="bg-white rounded-2xl shadow-md w-full max-w-md p-8">
            <div class="text-center mb-6">
                <h2 class="text-2xl font-semibold text-gray-800">{{ typeTitle }}</h2>
                <p class="text-gray-500 mt-1 text-sm">
                    {{ type === 'login' ? 'Welcome back! Please login to your account.' : 'Create a new account to get started.' }}
                </p>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input v-model="email" type="email" placeholder="you@example.com"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-400 outline-none transition-all text-gray-700 text-sm"
                        :class="{ 'border-red-500': errors.email }" />
                    <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div class="relative">
                        <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-400 outline-none transition-all text-gray-700 text-sm"
                            :class="{ 'border-red-500': errors.password }" />
                        <button type="button" @click="showPassword = !showPassword"
                            class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.418 0-8-3.582-8-8 0-1.45.391-2.81 1.07-4.002m3.473-2.49A7.968 7.968 0 0112 5c4.418 0 8 3.582 8 8 0 1.454-.394 2.815-1.073 4.01m-2.727 2.72L3 3" />
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                    </div>
                    <p v-if="errors.password" class="mt-1 text-xs text-red-600">{{ errors.password }}</p>
                </div>
                <div v-if="type === 'register'">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <div class="relative">
                        <input v-model="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
                            placeholder="••••••••"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-400 outline-none transition-all text-gray-700 text-sm"
                            :class="{ 'border-red-500': errors.confirmPassword }" />
                        <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                            class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <svg v-if="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.418 0-8-3.582-8-8 0-1.45.391-2.81 1.07-4.002m3.473-2.49A7.968 7.968 0 0112 5c4.418 0 8 3.582 8 8 0 1.454-.394 2.815-1.073 4.01m-2.727 2.72L3 3" />
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                    </div>
                    <p v-if="errors.confirmPassword" class="mt-1 text-xs text-red-600">{{ errors.confirmPassword }}</p>
                </div>
                <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs">
                    {{ error }}
                </div>

                <button type="submit" :disabled="loading"
                    class="w-full bg-gray-200 text-gray-700 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                    <span v-if="!loading">{{ typeTitle }}</span>
                    <span v-else>Processing...</span>
                </button>

                <p class="text-center text-sm text-gray-600 mt-2">
                    {{ type === 'login' ? "Don't have an account?" : "Already have an account?" }}
                    <NuxtLink :to="type === 'login' ? '/register' : '/login'"
                        class="text-gray-700 hover:underline ml-1">
                        {{ type === 'login' ? 'Sign Up' : 'Login' }}
                    </NuxtLink>
                </p>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { PropType } from 'vue'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

const props = defineProps({
    type: {
        type: String as PropType<'login' | 'register'>,
        required: true
    }
})

const email = ref('')
const password = ref('')
const showConfirmPassword = ref(false)
const confirmPassword = ref('')
const error = ref<string | null>(null)
const loading = ref(false)
const showPassword = ref(false)
const router = useRouter()
const { $firebase } = useNuxtApp()

const errors = reactive({
    email: '',
    password: '',
    confirmPassword: ''
})

const typeTitle = props.type === 'login' ? 'Login' : 'Sign Up'

const validateForm = (): boolean => {
    let isValid = true
    errors.email = ''
    errors.password = ''
    errors.confirmPassword = ''

    if (!email.value) {
        errors.email = 'Email is required'
        isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        errors.email = 'Please enter a valid email'
        isValid = false
    }

    if (!password.value) {
        errors.password = 'Password is required'
        isValid = false
    } else if (password.value.length < 6) {
        errors.password = 'Password must be at least 6 characters'
        isValid = false
    }

    if (props.type === 'register') {
        if (!confirmPassword.value) {
            errors.confirmPassword = 'Please confirm your password'
            isValid = false
        } else if (password.value !== confirmPassword.value) {
            errors.confirmPassword = 'Passwords do not match'
            isValid = false
        }
    }

    return isValid
}

const handleSubmit = async () => {
    if (!validateForm()) return

    error.value = null
    loading.value = true

    try {
        if (props.type === 'login') {
            await signInWithEmailAndPassword($firebase.auth!, email.value, password.value)
        } else {
            await createUserWithEmailAndPassword($firebase.auth!, email.value, password.value)
        }
        router.push('/')
    } catch (err: any) {
        loading.value = false
        switch (err.code) {
            case 'auth/user-not-found': error.value = 'No account found with this email.'; break
            case 'auth/wrong-password': error.value = 'Incorrect password.'; break
            case 'auth/email-already-in-use': error.value = 'Email already in use.'; break
            case 'auth/invalid-email': error.value = 'Invalid email address.'; break
            case 'auth/weak-password': error.value = 'Password should be at least 6 characters.'; break
            default: error.value = 'An error occurred. Please try again.'
        }
        console.error('Auth error:', err)
    }
}
</script>
