import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { SEED_ADS } from '@/lib/seedData'
import { canMove } from '@/lib/transitions'

// True when Supabase creds are not configured
const USE_SEED =
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder') ||
  import.meta.env.VITE_SUPABASE_URL === 'https://your-project.supabase.co'

async function fetchAds() {
  if (USE_SEED) return SEED_ADS

  const { data, error } = await supabase
    .from('ads')
    .select(`
      *,
      activity_log (
        id, ad_id, action, performed_by, note, created_at
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    // Schema cache miss — happens on first deploy or after table changes.
    // Wait 2s and retry once; Supabase reloads the schema cache automatically.
    if (error.code === 'PGRST200' || error.message?.includes('schema cache')) {
      await new Promise((r) => setTimeout(r, 2000))
      const retry = await supabase
        .from('ads')
        .select('*, activity_log(id, ad_id, action, performed_by, note, created_at)')
        .order('created_at', { ascending: false })
      if (retry.error) throw retry.error
      return retry.data
    }
    throw error
  }

  return data
}

export function useAds() {
  const queryClient     = useQueryClient()
  const activeUser      = useAppStore((s) => s.activeUser)
  const addNotification = useAppStore((s) => s.addNotification)

  const { data: ads = [], isLoading, isError, error } = useQuery({
    queryKey: ['ads'],
    queryFn:  fetchAds,
    retry:    2,
    retryDelay: 1500,
  })

  // Realtime subscription
  useEffect(() => {
    if (USE_SEED) return
    const channel = supabase
      .channel('ads-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ads' }, () => {
        queryClient.invalidateQueries({ queryKey: ['ads'] })
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [queryClient])

  // Move ad to new stage
  const moveAd = useMutation({
    mutationFn: async ({ adId, newStage }) => {
      const ad = ads.find((a) => a.id === adId)
      if (!ad) throw new Error('Ad not found')
      if (!canMove(ad, newStage)) throw new Error(`Cannot move to ${newStage} yet`)

      if (USE_SEED) {
        const updated = {
          ...ad,
          stage:              newStage,
          stage_entered_at:   new Date().toISOString(),
          testing_started_at: newStage === 'Testing' ? new Date().toISOString() : ad.testing_started_at,
          revision_round:     newStage === 'Ad Revision' ? ad.revision_round + 1 : ad.revision_round,
          activity_log: [
            ...(ad.activity_log || []),
            {
              id:           String(Date.now()),
              ad_id:        adId,
              action:       `Moved to ${newStage}`,
              performed_by: activeUser,
              note:         null,
              created_at:   new Date().toISOString(),
            },
          ],
        }
        queryClient.setQueryData(['ads'], (prev) =>
          prev.map((a) => (a.id === adId ? updated : a))
        )
        return updated
      }

      const { data, error } = await supabase.rpc('move_ad_stage', {
        ad_id:     adId,
        new_stage: newStage,
        moved_by:  activeUser,
      })
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_, { newStage }) => {
      if (!USE_SEED) queryClient.invalidateQueries({ queryKey: ['ads'] })
      addNotification(`Moved to ${newStage}`, 'info')
    },
    onError: (err) => addNotification(err.message, 'error'),
  })

  // Add manual note
  const addNote = useMutation({
    mutationFn: async ({ adId, noteText }) => {
      if (USE_SEED) {
        const entry = {
          id:           String(Date.now()),
          ad_id:        adId,
          action:       'Note added',
          performed_by: activeUser,
          note:         noteText,
          created_at:   new Date().toISOString(),
        }
        queryClient.setQueryData(['ads'], (prev) =>
          prev.map((a) =>
            a.id === adId
              ? { ...a, activity_log: [...(a.activity_log || []), entry] }
              : a
          )
        )
        return entry
      }
      const { data, error } = await supabase.rpc('add_activity_note', {
        ad_id:     adId,
        note_text: noteText,
        added_by:  activeUser,
      })
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      if (!USE_SEED) queryClient.invalidateQueries({ queryKey: ['ads'] })
      addNotification('Note added', 'success')
    },
    onError: (err) => addNotification(err.message, 'error'),
  })

  // Create new ad
  const createAd = useMutation({
    mutationFn: async (fields) => {
      if (USE_SEED) {
        const id = String(Date.now())
        const newAd = {
          ...fields,
          id,
          stage:              'Idea',
          revision_round:     0,
          max_revisions:      2,
          ad_spend:           0,
          testing_started_at: null,
          stage_entered_at:   new Date().toISOString(),
          created_at:         new Date().toISOString(),
          updated_at:         new Date().toISOString(),
          activity_log: [{
            id:           String(Date.now() + 1),
            ad_id:        id,
            action:       'Ad created',
            performed_by: activeUser,
            note:         null,
            created_at:   new Date().toISOString(),
          }],
        }
        queryClient.setQueryData(['ads'], (prev) => [newAd, ...(prev || [])])
        return newAd
      }
      const { data, error } = await supabase
        .from('ads')
        .insert(fields)
        .select('*, activity_log(id, ad_id, action, performed_by, note, created_at)')
        .single()
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      if (!USE_SEED) queryClient.invalidateQueries({ queryKey: ['ads'] })
      addNotification('New ad created', 'success')
    },
    onError: (err) => addNotification(err.message, 'error'),
  })

  // Update ad fields (title, assignee, priority, etc.)
  const updateAd = useMutation({
    mutationFn: async ({ adId, updates }) => {
      if (USE_SEED) {
        queryClient.setQueryData(['ads'], (prev) =>
          prev.map((a) => (a.id === adId ? { ...a, ...updates } : a))
        )
        return updates
      }
      const { data, error } = await supabase
        .from('ads')
        .update(updates)
        .eq('id', adId)
        .select()
        .single()
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      if (!USE_SEED) queryClient.invalidateQueries({ queryKey: ['ads'] })
    },
    onError: (err) => addNotification(err.message, 'error'),
  })

  return { ads, isLoading, isError, error, moveAd, addNote, createAd, updateAd }
}
