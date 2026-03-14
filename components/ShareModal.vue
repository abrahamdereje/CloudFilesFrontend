<template>
    <div class="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <div class="flex justify-between items-center">
                <h3 class="text-lg font-medium text-gray-800">Share File</h3>
                <button @click="$emit('close')" class="text-gray-500 hover:text-red-700 text-xl">✕</button>
            </div>

            <div class="space-y-3">
                <p class="text-sm text-gray-600 truncate">{{ filename }}</p>

                <div class="space-y-3">
                    <div class="flex items-center space-x-2">
                        <input type="checkbox" id="hasPassword" v-model="hasPassword" class="rounded">
                        <label for="hasPassword" class="text-sm text-gray-700">Password protect</label>
                    </div>

                    <div v-if="hasPassword" class="mt-2">
                        <input type="password" v-model="password" placeholder="Enter password"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-400 outline-none">
                    </div>

                    <div class="flex items-center space-x-2">
                        <input type="checkbox" id="hasExpiry" v-model="hasExpiry" class="rounded">
                        <label for="hasExpiry" class="text-sm text-gray-700">Set expiration date</label>
                    </div>

                    <div v-if="hasExpiry" class="mt-2">
                        <input type="datetime-local" v-model="expiresAt"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-400 outline-none">
                    </div>

                    <div class="flex items-center space-x-2">
                        <input type="checkbox" id="hasDownloadLimit" v-model="hasDownloadLimit" class="rounded">
                        <label for="hasDownloadLimit" class="text-sm text-gray-700">Limit downloads</label>
                    </div>

                    <div v-if="hasDownloadLimit" class="mt-2">
                        <input type="number" v-model="maxDownloads" min="1" placeholder="Maximum downloads"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-gray-400 outline-none">
                    </div>
                </div>

                <div v-if="shareUrl" class="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <p class="text-xs text-gray-500 mb-1">Share link:</p>
                    <div class="flex items-center space-x-2">
                        <input type="text" :value="shareUrl" readonly
                            class="flex-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded-md">
                        <button @click="copyToClipboard"
                            class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-xs hover:bg-gray-300 transition-colors">
                            Copy
                        </button>
                    </div>
                    <p v-if="copied" class="text-xs text-green-600 mt-1">Copied to clipboard!</p>
                </div>
            </div>

            <div class="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                <button @click="$emit('close')"
                    class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                    Cancel
                </button>
                <button @click="createShare" :disabled="creating"
                    class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
                    {{ creating ? 'Creating...' : 'Create Share Link' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    fileId: {
        type: [String, Number],
        required: true
    },
    filename: {
        type: String,
        required: true
    }
})

const emit = defineEmits(['close', 'created'])

const hasPassword = ref(false)
const password = ref('')
const hasExpiry = ref(false)
const expiresAt = ref('')
const hasDownloadLimit = ref(false)
const maxDownloads = ref('')
const creating = ref(false)
const shareUrl = ref('')
const copied = ref(false)

const createShare = async () => {
    creating.value = true
    try {
        const response = await fetch(`http://localhost:8000/api/files/${props.fileId}/shares`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                password: hasPassword.value ? password.value : null,
                expires_at: hasExpiry.value ? expiresAt.value : null,
                max_downloads: hasDownloadLimit.value ? parseInt(maxDownloads.value) : null
            })
        })

        const data = await response.json()
        if (data.success) {
            shareUrl.value = data.data.share_url
            emit('created', data.data)
        }
    } catch (error) {
        console.error('Share creation failed:', error)
    } finally {
        creating.value = false
    }
}

const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
}
</script>