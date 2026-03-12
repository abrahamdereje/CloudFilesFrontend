import { useAuth } from './useAuth'

export const useApi = () => {
    const { user } = useAuth()

    const API_BASE = 'http://localhost:8000/api' 
    const getHeaders = () => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }

        if (user.value) {
        }

        return headers
    }

    // File upload (multipart/form-data 
    const uploadFile = async (file: File, isPublic = false) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('is_public', String(isPublic))

        try {
            const response = await fetch(`${API_BASE}/files/upload`, {
                method: 'POST',
                body: formData,
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