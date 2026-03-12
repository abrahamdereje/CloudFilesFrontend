<template>
    <div class="space-y-6">
        <div class="bg-white shadow-md rounded-2xl p-8 text-gray-800">
           <div class="flex items-center justify-between">
            <div>
                <h3 class="font-bold text-gray-700">My Files</h3>
                <p class="text-sm text-gray-500 py-2">Upload and manage your files</p>
            </div>
            <button @click="showUploadModal = true"
                class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm">
                Upload File
            </button>
        </div>
        <div v-if="loading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-transparent">
            </div>
            <p class="mt-2 text-gray-500 text-sm">Loading files...</p>
        </div>

        <div v-else-if="files.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="file in files" :key="file.path"
                class="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow text-sm">
                <p class="truncate text-gray-800 font-medium" :title="file.name">{{ file.name }}</p>
                <p class="text-gray-500 mt-1">{{ formatFileSize(file.size) }}</p>
                <p class="text-gray-400 text-xs mt-1">Uploaded {{ formatDate(file.last_modified) }}</p>
                <a :href="file.url" target="_blank" class="block mt-2 text-gray-600 hover:underline text-xs">View
                    File</a>
            </div>
        </div>

        <div v-else class="text-center py-12">
            <h4 class="text-md font-medium text-gray-600 mb-2">No files yet</h4>
            <p class="text-gray-500 mb-4 text-sm">Upload your first file to get started</p>
            <button @click="showUploadModal = true"
                class="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm">
                Upload Now
            </button>
        </div>

        <!-- Upload Modal -->
        <div v-if="showUploadModal" class="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div class="bg-white rounded-xl max-w-sm w-full p-5 space-y-4">
                <div class="flex justify-between items-center">
                    <h3 class="text-md font-medium text-gray-700">Upload File</h3>
                    <button @click="closeModal" class="text-gray-500 hover:text-red-700 text-xl cursor-pointer">X</button>
                </div>

                <div @dragenter.prevent="dragging = true" @dragleave.prevent="dragging = false" @dragover.prevent
                    @drop.prevent="handleDrop"
                    class="border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors text-sm"
                    :class="dragging ? 'border-gray-400 bg-gray-50' : 'border-gray-300 hover:border-gray-400'"
                    @click="triggerFileInput">
                    <input ref="fileInput" type="file" @change="handleFileSelect" class="hidden" multiple />
                    <div v-if="!selectedFiles.length">
                        <p class="text-gray-600">Drag and drop your files here</p>
                        <p class="text-gray-400 text-xs mt-1">or click to browse</p>
                    </div>

                    <div v-else class="space-y-2 mt-2">
                        <div v-for="file in selectedFiles" :key="file.name"
                            class="flex justify-between bg-gray-50 p-2 rounded text-sm text-gray-700">
                            <p class="truncate">{{ file.name }}</p>
                            <p class="text-gray-400">{{ formatFileSize(file.size) }}</p>
                        </div>
                    </div>
                </div>
                <div v-if="uploading">
                    <div class="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Uploading...</span>
                        <span>{{ uploadProgress }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-1">
                        <div class="bg-gray-400 rounded-full h-1 transition-all"
                            :style="{ width: uploadProgress + '%' }"></div>
                    </div>
                </div>
                <div v-if="uploadError" class="p-2 bg-red-50 text-red-700 rounded text-xs">
                    {{ uploadError }}
                </div>

                <div class="flex justify-end space-x-2 mt-3">
                    <button @click="closeModal"
                        class="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-200 rounded-md hover:bg-red-300 transition-colors">Cancel</button>
                    <button @click="uploadFiles" :disabled="!selectedFiles.length || uploading"
                        class="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                        <span v-if="!uploading">Upload {{ selectedFiles.length }} file(s)</span>
                        <span v-else>Uploading...</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'

const { uploadFile, listFiles } = useApi()

const files = ref<any[]>([])
const loading = ref(false)
const showUploadModal = ref(false)
const dragging = ref(false)
const selectedFiles = ref<File[]>([])
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)


const loadFiles = async () => {
    loading.value = true
    try {
        const response = await listFiles()
        if (response.success) {
            files.value = response.files
        }
    } catch (error) {
        console.error('Failed to load files:', error)
    } finally {
        loading.value = false
    }
}


const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}


const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
}

const triggerFileInput = () => {
    fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files) {
        addFiles(Array.from(target.files))
    }
}

const handleDrop = (event: DragEvent) => {
    dragging.value = false
    if (event.dataTransfer?.files) {
        addFiles(Array.from(event.dataTransfer.files))
    }
}

const addFiles = (newFiles: File[]) => {
    selectedFiles.value = [...selectedFiles.value, ...newFiles]
}



const uploadFiles = async () => {
    if (!selectedFiles.value.length) return

    uploading.value = true
    uploadError.value = ''
    uploadProgress.value = 0

    try {
        for (let i = 0; i < selectedFiles.value.length; i++) {
            const file = selectedFiles.value[i]
            const response = await uploadFile(file, false)

            if (!response.success) {
                throw new Error(response.error || 'Upload failed')
            }

            uploadProgress.value = Math.round(((i + 1) / selectedFiles.value.length) * 100)
        }
        closeModal()
        await loadFiles()

    } catch (error: any) {
        uploadError.value = error.message || 'Upload failed. Please try again.'
    } finally {
        uploading.value = false
        uploadProgress.value = 0
    }
}


const closeModal = () => {
    showUploadModal.value = false
    selectedFiles.value = []
    uploadError.value = ''
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

onMounted(async () => {
    await loadFiles()
})
</script>