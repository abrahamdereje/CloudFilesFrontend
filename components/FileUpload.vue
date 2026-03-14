<template>
    <div class="space-y-6">
        <div class="bg-white shadow-md rounded-2xl p-8 text-gray-800">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h3 class="font-bold text-gray-700">My Files</h3>
                    <p class="text-sm text-gray-500">Upload and manage your files</p>
                </div>
                <button @click="showUploadModal = true"
                    class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm">
                    Upload File
                </button>
            </div>

            <div v-if="loading" class="text-center py-8">
                <div
                    class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-transparent">
                </div>
                <p class="mt-2 text-gray-500 text-sm">Loading files...</p>
            </div>

            <div v-else-if="files.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="file in files" :key="file.id || file.path"
                    class="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow flex flex-col h-full">
                    <div class="mb-2">
                        <span class="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                            {{ getFileType(file) }}
                        </span>
                    </div>
                    <h4 class="font-medium text-gray-800 mb-1 truncate" :title="file.name">
                        {{ file.name }}
                    </h4>
                    <div class="text-xs text-gray-500 space-y-1 mb-3">
                        <div class="flex items-center">
                            <span class="w-16 text-gray-400">Size:</span>
                            <span>{{ file.formatted_size || formatFileSize(file.size) }}</span>
                        </div>
                        <div class="flex items-center">
                            <span class="w-16 text-gray-400">Uploaded:</span>
                            <span>{{ formatDate(file.last_modified || file.uploaded_at) }}</span>
                        </div>
                    </div>
                    <div class="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                        <a :href="file.url" target="_blank"
                            class="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                            <span>View</span>
                            <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14">
                                </path>
                            </svg>
                        </a>
                        <div class="flex space-x-2">
                            <button @click="openShareModal(file)"
                                class="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
                                Share
                            </button>
                            <button @click="confirmDelete(file)"
                                class="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="text-center py-12">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="text-2xl">📁</span>
                </div>
                <h4 class="text-md font-medium text-gray-600 mb-2">No files yet</h4>
                <p class="text-gray-500 mb-4 text-sm">Upload your first file to get started</p>
                <button @click="showUploadModal = true"
                    class="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm">
                    Upload Now
                </button>
            </div>

            <div v-if="showUploadModal" class="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
                <div class="bg-white rounded-xl max-w-sm w-full p-5 space-y-4">
                    <div class="flex justify-between items-center">
                        <h3 class="text-md font-medium text-gray-700">Upload File</h3>
                        <button @click="closeModal"
                            class="text-gray-500 hover:text-red-700 text-xl cursor-pointer">X</button>
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
            <!-- Share Modal -->
            <ShareModal v-if="showShareModal" :file-id="selectedFileForShare?.id" :filename="selectedFileForShare?.name"
                @close="showShareModal = false" @created="handleShareCreated" />
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import ShareModal from './ShareModal.vue'

const { uploadFile, listFiles, deleteFile } = useApi()

const files = ref([])
const loading = ref(false)
const showUploadModal = ref(false)
const dragging = ref(false)
const selectedFiles = ref([])
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadError = ref('')
const fileInput = ref(null)
const showShareModal = ref(false)
const selectedFileForShare = ref(null)

const getFileType = (file) => {
    let extension = file.extension || ''

    if (!extension && file.name) {
        extension = file.name.split('.').pop() || ''
    }

    if (!extension && file.filename) {
        extension = file.filename.split('.').pop() || ''
    }
    extension = extension.toLowerCase().trim()

    const typeMap = {
        'pdf': 'PDF',
        'jpg': 'JPG', 'jpeg': 'JPG', 'png': 'PNG', 'gif': 'GIF', 'svg': 'SVG',
        'doc': 'DOC', 'docx': 'DOCX',
        'xls': 'XLS', 'xlsx': 'XLSX',
        'txt': 'TXT', 'md': 'MD',
        'mp3': 'MP3', 'wav': 'WAV',
        'mp4': 'MP4', 'mov': 'MOV', 'avi': 'AVI',
        'zip': 'ZIP', 'rar': 'RAR', '7z': '7Z',
        'html': 'HTML', 'css': 'CSS', 'js': 'JS', 'php': 'PHP',
        'json': 'JSON', 'xml': 'XML',
        'ppt': 'PPT', 'pptx': 'PPTX'
    }

    return typeMap[extension] || extension.toUpperCase() || 'FILE'
}

const formatFileSize = (size) => {
    if (!size) return '0 B'

    if (typeof size === 'string' && size.includes(' ')) {
        return size
    }
    const bytes = parseInt(size)
    if (isNaN(bytes)) return '0 B'

    const units = ['B', 'KB', 'MB', 'GB']
    let value = bytes
    let unitIndex = 0

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024
        unitIndex++
    }

    return value.toFixed(2) + ' ' + units[unitIndex]
}

const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date'

    try {
        let date
        if (typeof dateString === 'string') {
            date = new Date(dateString.replace(' ', 'T'))
        } else {
            date = new Date(dateString)
        }

        if (isNaN(date.getTime())) {
            console.warn('Invalid date:', dateString)
            return 'Invalid Date'
        }

        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (days === 0) return 'Today'
        if (days === 1) return 'Yesterday'
        if (days < 7) return `${days} days ago`

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    } catch (e) {
        console.error('Date formatting error:', e)
        return 'Invalid Date'
    }
}

const loadFiles = async () => {
    loading.value = true
    try {
        const response = await listFiles()
        console.log('API Response:', response)

        if (response.success) {
            files.value = response.files.map(file => ({
                id: file.id,
                path: file.path || file.s3_path,
                name: file.original_filename || file.name || file.filename,
                filename: file.original_filename || file.name || file.filename,
                size: file.size,
                formatted_size: formatFileSize(file.size),
                last_modified: file.uploaded_at || file.last_modified,
                url: file.url,
                extension: file.extension || (file.name ? file.name.split('.').pop() : '')
            }))
            console.log('Processed files:', files.value)
        }
    } catch (error) {
        console.error('Failed to load files:', error)
    } finally {
        loading.value = false
    }
}

const openShareModal = (file) => {
    selectedFileForShare.value = file
    showShareModal.value = true
}

const handleShareCreated = (shareData) => {
    console.log('Share created:', shareData)
    // You could show a notification here
}

const confirmDelete = async (file) => {
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) {
        return
    }

    try {
        const response = await deleteFile(file.path || file.id)
        if (response.success) {
            await loadFiles()
        }
    } catch (error) {
        console.error('Delete failed:', error)
    }
}


const triggerFileInput = () => {
    fileInput.value?.click()
}

const handleFileSelect = (event) => {
    const target = event.target
    if (target.files) {
        addFiles(Array.from(target.files))
    }
}

const handleDrop = (event) => {
    dragging.value = false
    if (event.dataTransfer?.files) {
        addFiles(Array.from(event.dataTransfer.files))
    }
}

const addFiles = (newFiles) => {
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
    } catch (error) {
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