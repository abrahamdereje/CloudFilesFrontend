<template>
    <div class="space-y-6">
        <!-- Welcome Banner -->
        <div class="bg-white shadow-md rounded-2xl p-8 text-gray-800">
            <h1 class="text-3xl font-semibold mb-2">
                Welcome back, {{ user?.email?.split('@')[0] || 'User' }}
            </h1>
            <p class="text-gray-500 text-lg">Your secure cloud storage solution</p>

            <!-- Storage Stats -->
            <div v-if="stats" class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p class="text-gray-400 text-sm">Total Files</p>
                    <p class="text-xl font-bold text-gray-800">{{ stats.total_files }}</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p class="text-gray-400 text-sm">Used Space</p>
                    <p class="text-xl font-bold text-gray-800">{{ stats.formatted_size || '0 B' }}</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p class="text-gray-400 text-sm">Storage</p>
                    <p class="text-xl font-bold text-gray-800">10 GB</p>
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
import { useApi } from '~/composables/useApi'
import { ref, onMounted } from 'vue'

definePageMeta({
    middleware: 'auth'
})

const { user } = useAuth()
const { getStats } = useApi()
const stats = ref<any>(null)

onMounted(async () => {
    try {
        const response = await getStats()
        if (response.success) {
            stats.value = response.data
        }
    } catch (error) {
        console.error('Failed to load stats:', error)
    }
})
</script>