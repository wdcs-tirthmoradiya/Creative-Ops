import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { SEED_LEARNINGS } from '@/lib/seedData'

const USE_SEED = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

export function useLearnings() {
  const queryClient   = useQueryClient()
  const activeUser    = useAppStore((s) => s.activeUser)
  const addNotification = useAppStore((s) => s.addNotification)

  const { data: learnings = [], isLoading } = useQuery({
    queryKey: ['learnings'],
    queryFn: async () => {
      if (USE_SEED) return SEED_LEARNINGS
      const { data, error } = await supabase
        .from('learnings')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  const createLearning = useMutation({
    mutationFn: async (fields) => {
      const entry = { ...fields, id: String(Date.now()), logged_by: activeUser, created_at: new Date().toISOString() }
      if (USE_SEED) {
        queryClient.setQueryData(['learnings'], (prev) => [entry, ...(prev || [])])
        return entry
      }
      const { data, error } = await supabase
        .from('learnings')
        .insert({ ...fields, logged_by: activeUser })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      if (!USE_SEED) queryClient.invalidateQueries({ queryKey: ['learnings'] })
      addNotification('Learning logged', 'success')
    },
    onError: (err) => addNotification(err.message, 'error'),
  })

  return { learnings, isLoading, createLearning }
}
