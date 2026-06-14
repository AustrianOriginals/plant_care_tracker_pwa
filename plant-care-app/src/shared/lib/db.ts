import Dexie, { type EntityTable } from 'dexie'
import type { Plant, CareEvent } from '../../features/plants/types.ts'

// ─── Datenbank Definition ─────────────────────────────────────────────────────

class PlantCareDatabase extends Dexie {
    plants!: EntityTable<Plant, 'id'>
    careEvents!: EntityTable<CareEvent, 'id'>

    constructor() {
        super('PlantCareDB')

        this.version(1).stores({
            // '&id' = primary key (unique)
            // 'plantType', 'lastWateredAt' = durchsuchbare Indizes
            plants:     '&id, plantType, lastWateredAt, lastFertilizedAt',
            careEvents: '&id, plantId, type, performedAt',
            //                 ↑ plantId als Index damit wir schnell alle
            //                   Events einer Pflanze abfragen können
        })
    }
}

export const db = new PlantCareDatabase()