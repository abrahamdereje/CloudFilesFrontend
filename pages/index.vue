<template>
    <div class="space-y-6">
        <div class="bg-white shadow-md rounded-2xl p-8 text-gray-800">
            <p class="text-gray-500">Your secured cloud storage solution</p>
            <!-- Storage Stats -->
            <div v-if="stats" class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p class="text-gray-400 text-sm">Total Files</p>
                    <p class="text-xl font-bold text-gray-800">{{ stats.total_files }}</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p class="text-gray-400 text-sm">Used Space</p>
                    <p class="text-xl font-bold text-gray-800">{{ stats.formatted_total_size || '0 B' }}</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p class="text-gray-400 text-sm">Storage</p>
                    <p class="text-xl font-bold text-gray-800">10GB</p>
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

const { getStats } = useApi()
const stats = ref<any>(null)

onMounted(async () => {
    try {
        const response = await getStats()
        if (response.success) {
            stats.value = response.data
            console.log('Stats loaded:', stats.value) 
        }
    } catch (error) {
        console.error('Failed to load stats:', error)
    }
})
</script>