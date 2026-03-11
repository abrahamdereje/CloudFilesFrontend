<template>
    <div class="min-h-[80vh] flex items-center justify-center">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 transform transition-all hover:shadow-2xl">
            <!-- Header -->
            <div class="text-center mb-8">
                <div
                    class="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform">
                    <span class="text-white text-3xl font-bold">{{ type === 'login' ? '🔐' : '📝' }}</span>
                </div>
                <h2 class="text-3xl font-bold text-gray-800">{{ typeTitle }}</h2>
                <p class="text-gray-500 mt-2">
                    {{ type === 'login' ? 'Welcome back! Please login to your account.' : 'Create a new account to get started.' }}
                </p>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- Email Field -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div class="relative">
                        <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📧</span>
                        <input v-model="email" type="email" placeholder="you@example.com"
                            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            :class="{ 'border-red-500': errors.email }" />
                    </div>
                    <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
                </div>

                <!-- Password Field -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div class="relative">
                        <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔒</span>
                        <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••"
                            class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            :class="{ 'border-red-500': errors.password }" />
                        <button type="button" @click="showPassword = !showPassword"
                            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                        </button>
                    </div>
                    <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
                </div>

                <!-- Confirm Password (for register) -->
                <div v-if="type === 'register'">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                    <div class="relative">
                        <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔒</span>
                        <input v-model="confirmPassword" type="password" placeholder="••••••••"
                            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            :class="{ 'border-red-500': errors.confirmPassword }" />
                    </div>
                    <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
                </div>

                <!-- Error Message -->
                <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {{ error }}
                </div>

                <!-- Submit Button -->
                <button type="submit" :disabled="loading"
                    class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg">
                    <span v-if="!loading">{{ typeTitle }}</span>
                    <span v-else class="flex items-center justify-center">
                        <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
                                fill="none"></circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        Processing...
                    </span>
                </button>

                <!-- Toggle between Login/Register -->
                <p class="text-center text-sm text-gray-600">
                    {{ type === 'login' ? "Don't have an account?" : "Already have an account?" }}
                    <NuxtLink :to="type === 'login' ? '/register' : '/login'"
                        class="text-blue-600 hover:text-blue-700 font-medium hover:underline ml-1">
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
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth'

const props = defineProps({
    type: {
        type: String as PropType<'login' | 'register'>,
        required: true
    }
})

const email = ref('')
const password = ref('')
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

    // Email validation
    if (!email.value) {
        errors.email = 'Email is required'
        isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        errors.email = 'Please enter a valid email'
        isValid = false
    }

    // Password validation
    if (!password.value) {
        errors.password = 'Password is required'
        isValid = false
    } else if (password.value.length < 6) {
        errors.password = 'Password must be at least 6 characters'
        isValid = false
    }

    // Confirm password for register
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
        // Handle Firebase errors with user-friendly messages
        switch (err.code) {
            case 'auth/user-not-found':
                error.value = 'No account found with this email. Please sign up first.'
                break
            case 'auth/wrong-password':
                error.value = 'Incorrect password. Please try again.'
                break
            case 'auth/email-already-in-use':
                error.value = 'An account already exists with this email. Please login instead.'
                break
            case 'auth/invalid-email':
                error.value = 'Please enter a valid email address.'
                break
            case 'auth/weak-password':
                error.value = 'Password should be at least 6 characters.'
                break
            case 'auth/too-many-requests':
                error.value = 'Too many failed attempts. Please try again later.'
                break
            default:
                error.value = 'An error occurred. Please try again.'
                console.error('Auth error:', err)
        }
    }
}
</script>