<template>
    <div class="space-y-6">
        <!-- Welcome Banner -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <h1 class="text-4xl font-bold mb-2">Welcome back, {{ user?.email?.split('@')[0] || 'User' }}! 👋</h1>
            <p class="text-blue-100 text-lg">Your secure cloud storage solution</p>

            <!-- Storage Stats -->
            <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <p class="text-blue-100 text-sm">Total Storage</p>
                    <p class="text-2xl font-bold">15 GB</p>
                </div>
                <div class="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <p class="text-blue-100 text-sm">Used Space</p>
                    <p class="text-2xl font-bold">3.2 GB</p>
                </div>
                <div class="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <p class="text-blue-100 text-sm">Files</p>
                    <p class="text-2xl font-bold">24</p>
                </div>
            </div>
        </div>

        <!-- File Upload Component -->
        <FileUpload />
    </div>
</template>

<script setup lang="ts">
import FileUpload from '~/components/FileUpload.vue'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
    middleware: 'auth'
})

const { user } = useAuth()
</script>