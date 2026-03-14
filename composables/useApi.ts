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
    const listFiles = async () => {
        try {
            const response = await fetch(`${API_BASE}/files`, {
                headers: getHeaders()
            })
            const data = await response.json()

            if (data.success && data.files) {
                return {
                    success: true,
                    files: data.files.map(file => ({
                        ...file,
                        uploaded_at: file.uploaded_at || file.last_modified
                    }))
                }
            }
            return data
        } catch (error) {
            console.error('List files error:', error)
            throw error
        }
    }
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