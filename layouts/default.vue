<template>
    <div class="min-h-screen bg-gray-50">

        <nav class="bg-white shadow-md sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <NuxtLink to="/" class="flex items-center space-x-2">
                        <div class="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                            <span class="font-bold text-sm">AM</span>
                        </div>
                        <span class="font-bold text-gray-800 text-xl">AM Cloud</span>
                    </NuxtLink>
                    <div class="flex items-center space-x-4">
                        <template v-if="user">
                            <span class="text-sm text-gray-600 hidden sm:block">
                                Welcome, {{ user.email?.split('@')[0] }}
                            </span>
                            <button @click="handleLogout"
                                class="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-200 rounded-md hover:bg-red-300 transition-colors">
                                Logout
                            </button>
                        </template>
                        <template v-else>
                            <NuxtLink to="/login"
                                class="px-3 py-1.5 text-sm font-medium bg-blue-200 text-blue-700  hover:bg-blue-300  transition-colors rounded-md">
                                Login
                            </NuxtLink>
                            <NuxtLink to="/register"
                                class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
                                Sign Up
                            </NuxtLink>
                        </template>
                    </div>
                </div>
            </div>
        </nav>
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <NuxtPage />
        </main>
        <!-- Loading Overlay -->
        <div v-if="loading" class="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 flex flex-col items-center">
                <div class="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <p class="mt-4 text-gray-700">Loading...</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'
import { signOut } from 'firebase/auth'

const { user, loading } = useAuth()
const router = useRouter()
const { $firebase } = useNuxtApp()

const handleLogout = async () => {
    try {
        await signOut($firebase.auth!)
        router.push('/login')
    } catch (error) {
        console.error('Logout error:', error)
    }
}
</script>