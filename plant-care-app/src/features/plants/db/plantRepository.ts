import { db } from '../../../shared/lib/db.ts'
import type { Plant, CareEvent, CareEventType } from '../types'
import { PlantSchema, CareEventSchema } from '../schema'
import { v4 as uuidv4 } from 'uuid'

// ─── Plants ───────────────────────────────────────────────────────────────────

export const plantRepository = {

    async getAll(): Promise<Plant[]> {
        return db.plants.toArray()
    },

    async getById(id: string): Promise<Plant | undefined> {
        return db.plants.get(id)
    },

    async create(data: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Plant> {
        const now = new Date()
        const plant: Plant = {
            ...data,
            id: uuidv4(),
            createdAt: now,
            updatedAt: now,
        }

        // Zod Validierung vor dem Speichern
        PlantSchema.parse(plant)

        await db.plants.add(plant)
        return plant
    },

    async update(id: string, data: Partial<Omit<Plant, 'id' | 'createdAt'>>): Promise<Plant> {
        const existing = await db.plants.get(id)
        if (!existing) throw new Error(`Plant with id "${id}" not found`)

        const updated: Plant = {
            ...existing,
            ...data,
            updatedAt: new Date(),
        }

        PlantSchema.parse(updated)
        await db.plants.put(updated)
        return updated
    },

    async delete(id: string): Promise<void> {
        // Pflanze und alle zugehörigen Care Events löschen
        await db.transaction('rw', db.plants, db.careEvents, async () => {
            await db.plants.delete(id)
            await db.careEvents.where('plantId').equals(id).delete()
        })
    },
}

// ─── Care Events ──────────────────────────────────────────────────────────────

export const careEventRepository = {

    async getByPlantId(plantId: string): Promise<CareEvent[]> {
        return db.careEvents
            .where('plantId')
            .equals(plantId)
            .sortBy('performedAt')
    },

    async getLastEventByType(
        plantId: string,
        type: CareEventType
    ): Promise<CareEvent | undefined> {
        const events = await db.careEvents
            .where('plantId')
            .equals(plantId)
            .filter(e => e.type === type)
            .sortBy('performedAt')

        return events[events.length - 1] // letztes Event = neuestes
    },

    async create(data: Omit<CareEvent, 'id'>): Promise<CareEvent> {
        const event: CareEvent = {
            ...data,
            id: uuidv4(),
        }

        CareEventSchema.parse(event)
        await db.careEvents.add(event)

        // Pflanze updaten mit neuem lastXAt Datum
        if (data.type === 'watering') {
            await plantRepository.update(data.plantId, {
                lastWateredAt: data.performedAt,
            })
        } else if (data.type === 'fertilizing') {
            await plantRepository.update(data.plantId, {
                lastFertilizedAt: data.performedAt,
            })
        } else if (data.type === 'repotting') {
            await plantRepository.update(data.plantId, {
                lastRepottedAt: data.performedAt,
            })
        }

        return event
    },
}