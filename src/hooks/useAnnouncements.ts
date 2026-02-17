import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

export interface Announcement {
    id: string
    title: string
    content: string | null
    category: string | null
    image_url: string | null
    is_active: boolean
    published_at: string
    created_at: string
}

export function useAnnouncements() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchAnnouncements = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .order('published_at', { ascending: false })

            if (error) throw error
            setAnnouncements(data || [])
        } catch (error) {
            console.error('Error fetching announcements:', error)
            toast.error('Error al cargar los anuncios')
        } finally {
            setLoading(false)
        }
    }

    const createAnnouncement = async (announcement: Partial<Announcement>) => {
        try {
            const { data, error } = await supabase
                .from('announcements')
                .insert([announcement])
                .select()

            if (error) throw error
            toast.success('Anuncio creado correctamente')
            fetchAnnouncements()
            return data[0]
        } catch (error) {
            console.error('Error creating announcement:', error)
            toast.error('Error al crear el anuncio')
            return null
        }
    }

    const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
        try {
            const { error } = await supabase
                .from('announcements')
                .update(updates)
                .eq('id', id)

            if (error) throw error
            toast.success('Anuncio actualizado')
            fetchAnnouncements()
        } catch (error) {
            console.error('Error updating announcement:', error)
            toast.error('Error al actualizar el anuncio')
        }
    }

    const deleteAnnouncement = async (id: string) => {
        try {
            const { error } = await supabase
                .from('announcements')
                .delete()
                .eq('id', id)

            if (error) throw error
            toast.success('Anuncio eliminado')
            fetchAnnouncements()
        } catch (error) {
            console.error('Error deleting announcement:', error)
            toast.error('Error al eliminar el anuncio')
        }
    }

    useEffect(() => {
        fetchAnnouncements()
    }, [])

    return {
        announcements,
        loading,
        fetchAnnouncements,
        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement
    }
}
