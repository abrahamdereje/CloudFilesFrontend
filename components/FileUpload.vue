<template>
    <div class="bg-white rounded-xl shadow-lg p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h3 class="text-lg font-semibold text-gray-800">My Files</h3>
                <p class="text-sm text-gray-500">Upload and manage your files</p>
            </div>
            <button @click="showUploadModal = true"
                class="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center space-x-2 shadow-md hover:shadow-lg">
                <span>📤</span>
                <span>Upload File</span>
            </button>
        </div>

        <!-- Files Grid -->
        <div v-if="files.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="file in files" :key="file.id"
                class="border rounded-lg p-4 hover:shadow-md transition-shadow group relative">
                <div class="flex items-start justify-between">
                    <div class="flex items-center space-x-3">
                        <!-- File Icon based on type -->
                        <span class="text-2xl">{{ getFileIcon(file.name) }}</span>
                        <div>
                            <p class="font-medium text-gray-800 truncate max-w-[150px]">{{ file.name }}</p>
                            <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
                        </div>
                    </div>
                    <button @click="deleteFile(file.id)"
                        class="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700">
                        🗑️
                    </button>
                </div>
                <p class="text-xs text-gray-400 mt-2">Uploaded {{ formatDate(file.uploadedAt) }}</p>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
            <div class="text-6xl mb-4">📁</div>
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
                    <button @click="showUploadModal = false" class="text-gray-500 hover:text-gray-700">✕</button>
                </div>

                <!-- Drag & Drop Area -->
                <div @dragenter.prevent="dragging = true" @dragleave.prevent="dragging = false" @dragover.prevent
                    @drop.prevent="handleDrop"
                    class="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
                    :class="dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'">
                    <input ref="fileInput" type="file" @change="handleFileSelect" class="hidden" multiple />

                    <div v-if="!selectedFile">
                        <div class="text-4xl mb-3">📤</div>
                        <p class="text-gray-700 mb-2">Drag and drop your files here</p>
                        <p class="text-gray-500 text-sm mb-4">or</p>
                        <button @click="triggerFileInput"
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Browse Files
                        </button>
                    </div>

                    <!-- Selected Files Preview -->
                    <div v-else class="space-y-3">
                        <div v-for="file in selectedFile" :key="file.name"
                            class="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div class="flex items-center space-x-2">
                                <span class="text-2xl">{{ getFileIcon(file.name) }}</span>
                                <div class="text-left">
                                    <p class="font-medium text-gray-800">{{ file.name }}</p>
                                    <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
                                </div>
                            </div>
                            <button @click="removeFile(file)" class="text-red-500 hover:text-red-700">✕</button>
                        </div>

                        <button @click="uploadFiles" :disabled="uploading"
                            class="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50">
                            <span v-if="!uploading">Upload {{ selectedFile.length }} file(s)</span>
                            <span v-else class="flex items-center justify-center">
                                <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4" fill="none"></circle>
                                    <path class="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                    </path>
                                </svg>
                                Uploading...
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface File {
    id: string
    name: string
    size: number
    uploadedAt: Date
    type: string
}

const showUploadModal = ref(false)
const dragging = ref(false)
const selectedFile = ref<File[]>([])
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// Mock files data (replace with real data from Firebase Storage)
const files = ref<File[]>([
    {
        id: '1',
        name: 'document.pdf',
        size: 1024 * 1024 * 2.5, // 2.5 MB
        uploadedAt: new Date('2024-01-15'),
        type: 'application/pdf'
    },
    {
        id: '2',
        name: 'image.jpg',
        size: 1024 * 1024 * 1.2, // 1.2 MB
        uploadedAt: new Date('2024-01-14'),
        type: 'image/jpeg'
    },
    {
        id: '3',
        name: 'presentation.pptx',
        size: 1024 * 1024 * 5.8, // 5.8 MB
        uploadedAt: new Date('2024-01-13'),
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    }
])

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
        case 'ppt':
        case 'pptx': return '📽️'
        case 'mp4':
        case 'mov': return '🎬'
        case 'mp3':
        case 'wav': return '🎵'
        default: return '📁'
    }
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (date: Date): string => {
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
    selectedFile.value = [...selectedFile.value, ...newFiles]
}

const removeFile = (file: File) => {
    selectedFile.value = selectedFile.value.filter(f => f !== file)
}

const uploadFiles = async () => {
    uploading.value = true
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Add uploaded files to the list (mock)
    const newFiles = selectedFile.value.map((file, index) => ({
        id: Date.now() + index.toString(),
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
        type: file.type
    }))

    files.value = [...newFiles, ...files.value]

    // Reset
    selectedFile.value = []
    uploading.value = false
    showUploadModal.value = false
}

const deleteFile = (id: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
        files.value = files.value.filter(f => f.id !== id)
    }
}
</script>