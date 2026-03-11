<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <!-- Navigation -->
        <nav class="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <!-- Logo/Brand -->
                    <NuxtLink to="/" class="flex items-center space-x-2 group">
                        <div
                            class="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                            <span class="text-white font-bold text-xl">C</span>
                        </div>
                        <span class="font-bold text-xl text-gray-800">CloudStore</span>
                    </NuxtLink>

                    <!-- Navigation Links -->
                    <div class="flex items-center space-x-4">
                        <template v-if="user">
                            <span class="text-sm text-gray-600 hidden sm:block">
                                Welcome, {{ user.email?.split('@')[0] }}
                            </span>
                            <button @click="handleLogout"
                                class="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg">
                                Logout
                            </button>
                        </template>
                        <template v-else>
                            <NuxtLink to="/login"
                                class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                                Login
                            </NuxtLink>
                            <NuxtLink to="/register"
                                class="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg">
                                Sign Up
                            </NuxtLink>
                        </template>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <NuxtPage />
        </main>

        <!-- Loading Overlay -->
        <div v-if="loading" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div class="bg-white rounded-lg p-6 flex flex-col items-center">
                <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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