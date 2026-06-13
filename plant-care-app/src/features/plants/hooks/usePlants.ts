import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../../shared/lib/db'
import { plantRepository, careEventRepository } from '../db/plantRepository'
import type { CareEventType } from '../types'

// Alle Pflanzen live aus IndexedDB
export function usePlants() {
    const plants = useLiveQuery(() => db.plants.toArray(), [])
    return plants ?? []
}

// Eine einzelne Pflanze live
export function usePlant(id: string) {
    return useLiveQuery(() => db.plants.get(id), [id])
}

// Care Events einer Pflanze
export function useCareEvents(plantId: string) {
    return useLiveQuery(
        () => careEventRepository.getByPlantId(plantId),
        [plantId]
    )
}

// Eine Pflanze gießen / düngen / umtopfen
export function useCareActions() {
    const logCareEvent = async (
        plantId: string,
        type: CareEventType,
        notes?: string
    ) => {
        await careEventRepository.create({
            plantId,
            type,
            performedAt: new Date(),
            notes,
        })
    }

    return { logCareEvent }
}