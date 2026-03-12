// composables/useApi.ts
import { useAuth } from './useAuth'

export const useApi = () => {
    const { user } = useAuth()
    const config = useRuntimeConfig()

    const API_BASE = 'http://localhost:8000/api' // Your Laravel backend URL

    // Helper to get auth token (for Day 3 when you add Firebase)
    const getHeaders = () => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }

        // Add Firebase token if user is logged in (for Day 3)
        if (user.value) {
            // user.value.getIdToken() // You'll add this later
        }

        return headers
    }

    // File upload (multipart/form-data - don't set Content-Type)
    const uploadFile = async (file: File, isPublic = false) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('is_public', String(isPublic))

        try {
            const response = await fetch(`${API_BASE}/files/upload`, {
                method: 'POST',
                body: formData,
                // Don't set Content-Type header - browser will set it with boundary
            })

            return await response.json()
        } catch (error) {
            console.error('Upload error:', error)
            throw error
        }
    }

    // List all files
    const listFiles = async () => {
        try {
            const response = await fetch(`${API_BASE}/files`, {
                headers: getHeaders()
            })
            return await response.json()
        } catch (error) {
            console.error('List files error:', error)
            throw error
        }
    }

    // Get file stats
    const getStats = async () => {
        try {
            const response = await fetch(`${API_BASE}/files/stats`, {
                headers: getHeaders()
            })
            return await response.json()
        } catch (error) {
            console.error('Stats error:', error)
            throw error
        }
    }

    // Delete file
    const deleteFile = async (path: string) => {
        try {
            const response = await fetch(`${API_BASE}/files/${encodeURIComponent(path)}`, {
                method: 'DELETE',
                headers: getHeaders()
            })
            return await response.json()
        } catch (error) {
            console.error('Delete error:', error)
            throw error
        }
    }

    return {
        uploadFile,
        listFiles,
        getStats,
        deleteFile
    }
}