import { useMemo } from 'react'
import { PRIORITY_ORDER } from '@/lib/constants'

export function useMetrics(ads = []) {
  return useMemo(() => {
    const weekAgo   = Date.now() - 7  * 86_400_000
    const monthAgo  = Date.now() - 30 * 86_400_000
    const thisWeek  = ads.filter((a) => new Date(a.created_at).getTime() >= weekAgo)
    const completed = ads.filter((a) => ['Winner', 'Loser'].includes(a.stage))
    const winners   = completed.filter((a) => a.stage === 'Winner')
    const inTesting = ads.filter((a) => a.stage === 'Testing')

    // Hit rate
    const hitRate = completed.length
      ? Math.round((winners.length / completed.length) * 100)
      : 0

    // Avg revision rounds (all ads)
    const avgRevisions = ads.length
      ? (ads.reduce((s, a) => s + a.revision_round, 0) / ads.length).toFixed(1)
      : '0.0'

    // Spend by contributor
    const spendByEditor = {}
    ads.forEach((a) => {
      if (a.ad_spend > 0) {
        spendByEditor[a.assigned_to] = (spendByEditor[a.assigned_to] || 0) + Number(a.ad_spend)
      }
    })

    // New vs iterations this week
    const newConcepts = thisWeek.filter((a) => a.ad_type === 'New Concept').length
    const iterations  = thisWeek.filter((a) => a.ad_type === 'Iteration').length

    // Avg days from created_at to Pending Upload / Testing
    const uploadedAds = ads.filter((a) =>
      ['Pending Upload', 'Testing', 'Winner', 'Loser'].includes(a.stage)
    )
    const avgDaysToUpload = uploadedAds.length
      ? Math.round(
          uploadedAds.reduce((s, a) => {
            const ms = new Date(a.stage_entered_at).getTime() - new Date(a.created_at).getTime()
            return s + Math.max(0, ms / 86_400_000)
          }, 0) / uploadedAds.length
        )
      : 0

    // Format breakdown this week
    const formats = ['Video Ad', 'Static Ad', 'Native Ad'].map((f) => ({
      name:  f,
      count: thisWeek.filter((a) => a.format === f).length,
    }))

    // Weekly output (last 5 weeks)
    const weeks = Array.from({ length: 5 }, (_, i) => {
      const end   = Date.now() - i * 7 * 86_400_000
      const start = end - 7 * 86_400_000
      return {
        label: i === 0 ? 'This week' : `${i}w ago`,
        start,
        end,
        count: ads.filter((a) => {
          const t = new Date(a.created_at).getTime()
          return t >= start && t < end
        }).length,
      }
    }).reverse()

    // Output by strategist (this week)
    const strategists = [...new Set(ads.map((a) => a.strategist))]
    const byStrategist = strategists.map((s) => ({
      name:  s,
      count: thisWeek.filter((a) => a.strategist === s).length,
    })).sort((a, b) => b.count - a.count)

    // Output by editor (this week)
    const editors = [...new Set(ads.map((a) => a.assigned_to))]
    const byEditor = editors.map((e) => ({
      name:  e,
      count: thisWeek.filter((a) => a.assigned_to === e).length,
    })).sort((a, b) => b.count - a.count)

    // Avg days per stage (pipeline speed)
    const stageSpeed = [
      'Idea', 'Brief Writing', 'Brief Review',
      'Ad Creation', 'Ad Review', 'Ad Revision',
      'Pending Upload', 'Testing',
    ].map((stage) => {
      const stageAds = ads.filter((a) => a.stage === stage)
      const avg      = stageAds.length
        ? Math.round(
            stageAds.reduce((s, a) => {
              const ms = Date.now() - new Date(a.stage_entered_at).getTime()
              return s + ms / 86_400_000
            }, 0) / stageAds.length
          )
        : 0
      return { stage, avg, count: stageAds.length, hot: avg >= 5 }
    })

    return {
      // 8 KPI tiles
      volume:        thisWeek.length,
      hitRate,
      avgRevisions,
      spendByEditor,
      inTesting:     inTesting.length,
      newConcepts,
      iterations,
      avgDaysToUpload,
      formats,
      // Report data
      weeks,
      byStrategist,
      byEditor,
      stageSpeed,
      completed,
      winners,
    }
  }, [ads])
}
