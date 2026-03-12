<template>
    <div class="bg-white rounded-xl shadow-lg p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h3 class="text-lg font-semibold text-gray-800">My Files</h3>
                <p class="text-sm text-gray-500">Upload and manage your files</p>
            </div>
            <button @click="showUploadModal = true"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md flex items-center space-x-2">
                <span>Upload File</span>
            </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent">
            </div>
            <p class="mt-2 text-gray-600">Loading files...</p>
        </div>

        <!-- Files Grid -->
        <div v-else-if="files.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="file in files" :key="file.path"
                class="border rounded-lg p-4 hover:shadow-md transition-shadow group relative">
                <div class="flex items-start justify-between">
                    <div class="flex items-center space-x-3">
                        <!-- File Icon based on type -->
                        <span class="text-xl">{{ getFileIcon(file.name) }}</span>
                        <div class="flex-1 min-w-0">
                            <p class="font-medium text-gray-800 truncate" :title="file.name">
                                {{ file.name }}
                            </p>
                            <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
                        </div>
                    </div>
                    <button @click="confirmDelete(file)"
                        class="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700">
                        Delete
                    </button>
                </div>
                <p class="text-xs text-gray-400 mt-2">Uploaded {{ formatDate(file.last_modified) }}</p>

                <!-- Download/View Link -->
                <a :href="file.url" target="_blank"
                    class="mt-3 inline-flex items-center text-sm text-blue-600 hover:text-blue-800">
                    View File
                </a>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
            <h4 class="text-lg font-medium text-gray-700 mb-2">No files yet</h4>
            <p class="text-gray-500 mb-4">Upload your first file to get started</p>
            <button @click="showUploadModal = true"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Upload Now
            </button>
        </div>

        <!-- Upload Modal -->
        <div v-if="showUploadModal"
            class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div class="bg-white rounded-xl max-w-md w-full p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Upload File</h3>
                    <button @click="closeModal" class="text-gray-500 hover:text-gray-700">Close</button>
                </div>

                <!-- Upload Area -->
                <div @dragenter.prevent="dragging = true" @dragleave.prevent="dragging = false" @dragover.prevent
                    @drop.prevent="handleDrop"
                    class="border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer"
                    :class="dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'"
                    @click="triggerFileInput">
                    <input ref="fileInput" type="file" @change="handleFileSelect" class="hidden" multiple />

                    <div v-if="!selectedFiles.length">
                        <p class="text-gray-700 mb-2">Drag and drop your files here</p>
                        <p class="text-gray-500 text-sm">or click to browse</p>
                    </div>

                    <!-- Selected Files Preview -->
                    <div v-else class="space-y-3">
                        <div v-for="file in selectedFiles" :key="file.name"
                            class="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div class="flex items-center space-x-2">
                                <span class="text-xl">{{ getFileIcon(file.name) }}</span>
                                <div class="text-left">
                                    <p class="font-medium text-gray-800">{{ file.name }}</p>
                                    <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
                                </div>
                            </div>
                            <button @click.stop="removeFile(file)"
                                class="text-red-500 hover:text-red-700">Remove</button>
                        </div>
                    </div>
                </div>

                <!-- Upload Progress -->
                <div v-if="uploading" class="mt-4">
                    <div class="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Uploading...</span>
                        <span>{{ uploadProgress }}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-600 rounded-full h-2 transition-all duration-300"
                            :style="{ width: uploadProgress + '%' }"></div>
                    </div>
                </div>

                <!-- Upload Error -->
                <div v-if="uploadError" class="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    {{ uploadError }}
                </div>

                <!-- Modal Actions -->
                <div class="flex justify-end space-x-3 mt-6">
                    <button @click="closeModal" class="px-4 py-2 text-gray-600 hover:text-gray-800">
                        Cancel
                    </button>
                    <button @click="uploadFiles" :disabled="!selectedFiles.length || uploading"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        <span v-if="!uploading">Upload {{ selectedFiles.length }} file(s)</span>
                        <span v-else class="flex items-center">
                            Uploading...
                        </span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'

const { uploadFile, listFiles, deleteFile } = useApi()

// State
const files = ref<any[]>([])
const loading = ref(false)
const showUploadModal = ref(false)
const dragging = ref(false)
const selectedFiles = ref<File[]>([])
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

// Load files on mount
onMounted(async () => {
    await loadFiles()
})

// Load files from backend
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

// File icon based on extension
const getFileIcon = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
        case 'pdf': return '📄'
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif': return '🖼️'
        case 'doc':
        case 'docx': return '📝'
        case 'xls':
        case 'xlsx': return '📊'
        case 'txt': return '📃'
        default: return '📁'
    }
}

// Format file size
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Format date
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

// File selection handlers
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

const removeFile = (file: File) => {
    selectedFiles.value = selectedFiles.value.filter(f => f !== file)
}

// Upload files
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

        // Success - close modal and refresh files
        closeModal()
        await loadFiles()

    } catch (error: any) {
        uploadError.value = error.message || 'Upload failed. Please try again.'
    } finally {
        uploading.value = false
        uploadProgress.value = 0
    }
}

// Close modal and reset
const closeModal = () => {
    showUploadModal.value = false
    selectedFiles.value = []
    uploadError.value = ''
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

// Delete file with confirmation
const confirmDelete = async (file: any) => {
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) {
        return
    }

    try {
        const response = await deleteFile(file.path)
        if (response.success) {
            await loadFiles()
        }
    } catch (error) {
        console.error('Delete failed:', error)
    }
}
</script>