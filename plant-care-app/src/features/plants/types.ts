// ─── Enums ────────────────────────────────────────────────────────────────────

export type PlantType =
    | 'succulent'
    | 'tropical'
    | 'cactus'
    | 'herb'
    | 'fern'
    | 'flowering'
    | 'tree'
    | 'other'

export type SunlightLevel =
    | 'full_sun'
    | 'partial_sun'
    | 'indirect'
    | 'low_light'

export type PlantSize =
    | 'seedling'
    | 'small'
    | 'medium'
    | 'large'

export type CareEventType =
    | 'watering'
    | 'fertilizing'
    | 'repotting'
    | 'pruning'
    | 'note'

// ─── Topf-Geometrie ───────────────────────────────────────────────────────────

export type PotShape = 'cylindrical' | 'rectangular' | 'tapered'

export interface PotDimensions {
    shape: PotShape
    // Zylinder & konisch
    diameterCm?: number
    // Rechteckig
    lengthCm?: number
    widthCm?: number
    // Beide Formen
    heightCm: number
}

export interface PotInfo {
    dimensions: PotDimensions
    hasDrainageHole: boolean      // beeinflusst Gießfrequenz stark
    material?: 'terracotta' | 'plastic' | 'ceramic' | 'fabric' | 'other'
    // material beeinflusst Verdunstung:
    // terracotta = trocknet schneller, plastic = hält Feuchtigkeit länger
}
// ─── Core Entities ────────────────────────────────────────────────────────────

export interface Plant {
    id: string
    name: string
    species?: string
    plantType: PlantType
    pot: PotInfo
    plantSize: PlantSize
    sunlightLevel: SunlightLevel
    roomName?: string
    notes?: string
    imageUrl?: string
    createdAt: Date
    updatedAt: Date

    // Scheduling config
    wateringIntervalDays: number        // base interval in days
    fertilizingIntervalDays?: number
    repottingIntervalDays?: number

    // Last care dates (denormalized for quick access)
    lastWateredAt?: Date
    lastFertilizedAt?: Date
    lastRepottedAt?: Date
}

export interface CareEvent {
    id: string
    plantId: string
    type: CareEventType
    performedAt: Date
    notes?: string

    // For adaptive scheduling
    scheduledFor?: Date     // when it was supposed to happen
    earlyByDays?: number    // positive = early, negative = late
}

// ─── Scheduling ───────────────────────────────────────────────────────────────

export interface NextCareSchedule {
    plantId: string
    nextWateringAt: Date
    nextFertilizingAt?: Date
    nextRepottingAt?: Date
    urgencyScore: number    // 0–100, used for priority sorting
}

// ─── UI / View Models ─────────────────────────────────────────────────────────

export interface PlantWithSchedule extends Plant {
    schedule: NextCareSchedule
    isOverdue: boolean
    isDueToday: boolean
    daysUntilWatering: number
}