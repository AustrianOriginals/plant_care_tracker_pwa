import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../../shared/lib/db'
import { calcNextCareSchedule } from '../lib/schedulingEngine'
import type { Plant, PlantWithSchedule } from '../types'

// Gibt alle Pflanzen sortiert nach Dringlichkeit zurück
export function usePlantsWithSchedule(): PlantWithSchedule[] {
    const plants = useLiveQuery(() => db.plants.toArray(), [])
    const careEvents = useLiveQuery(() => db.careEvents.toArray(), [])

    return useMemo(() => {
        if (!plants || !careEvents) return []

        const now = new Date()

        return plants
            .map((plant: Plant) => {
                const plantEvents = careEvents.filter(e => e.plantId === plant.id)
                const schedule = calcNextCareSchedule(plant, plantEvents)
                const daysUntilWatering =
                    (schedule.nextWateringAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)

                return {
                    ...plant,
                    schedule,
                    isOverdue: daysUntilWatering < 0,
                    isDueToday: daysUntilWatering >= 0 && daysUntilWatering < 1,
                    daysUntilWatering,
                }
            })
            .sort((a, b) => b.schedule.urgencyScore - a.schedule.urgencyScore)
    }, [plants, careEvents])
}