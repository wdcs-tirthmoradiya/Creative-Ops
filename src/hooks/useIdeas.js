import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { SEED_IDEAS } from '@/lib/seedData'

const USE_SEED = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

export function useIdeas() {
  const queryClient   = useQueryClient()
  const activeUser    = useAppStore((s) => s.activeUser)
  const addNotification = useAppStore((s) => s.addNotification)

  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['ideas'],
    queryFn: async () => {
      if (USE_SEED) return SEED_IDEAS
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('promoted', false)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  const createIdea = useMutation({
    mutationFn: async (fields) => {
      const newIdea = { ...fields, id: String(Date.now()), submitted_by: activeUser, promoted: false, created_at: new Date().toISOString() }
      if (USE_SEED) {
        queryClient.setQueryData(['ideas'], (prev) => [newIdea, ...(prev || [])])
        return newIdea
      }
      const { data, error } = await supabase.from('ideas').insert({ ...fields, submitted_by: activeUser }).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      if (!USE_SEED) queryClient.invalidateQueries({ queryKey: ['ideas'] })
      addNotification('Idea logged', 'success')
    },
    onError: (err) => addNotification(err.message, 'error'),
  })

  const promoteIdea = useMutation({
    mutationFn: async (ideaId) => {
      if (USE_SEED) {
        queryClient.setQueryData(['ideas'], (prev) => prev.filter((i) => i.id !== ideaId))
        return ideaId
      }
      const { error } = await supabase.from('ideas').update({ promoted: true }).eq('id', ideaId)
      if (error) throw error
      return ideaId
    },
    onSuccess: () => {
      if (!USE_SEED) queryClient.invalidateQueries({ queryKey: ['ideas'] })
      addNotification('Idea promoted to pipeline', 'info')
    },
  })

  const deleteIdea = useMutation({
    mutationFn: async (ideaId) => {
      if (USE_SEED) {
        queryClient.setQueryData(['ideas'], (prev) => prev.filter((i) => i.id !== ideaId))
        return
      }
      const { error } = await supabase.from('ideas').delete().eq('id', ideaId)
      if (error) throw error
    },
    onSuccess: () => {
      if (!USE_SEED) queryClient.invalidateQueries({ queryKey: ['ideas'] })
    },
  })

  return { ideas, isLoading, createIdea, promoteIdea, deleteIdea }
}
