import { z } from 'zod'

// ─── Field Schemas ─────────────────────────────────────────────────────────────

export const PlantTypeSchema = z.enum([
    'succulent', 'tropical', 'cactus', 'herb',
    'fern', 'flowering', 'tree', 'other'
])

export const SunlightLevelSchema = z.enum([
    'full_sun', 'partial_sun', 'indirect', 'low_light'
])

export const PotShapeSchema = z.enum(['cylindrical', 'rectangular', 'tapered'])

export const PotDimensionsSchema = z.object({
    shape: PotShapeSchema,
    diameterCm: z.number().min(1).max(200).optional(),
    lengthCm: z.number().min(1).max(200).optional(),
    widthCm: z.number().min(1).max(200).optional(),
    heightCm: z.number().min(1).max(200),
}).refine(
    // Validierung: je nach Form müssen die richtigen Felder vorhanden sein
    (data) => {
        if (data.shape === 'cylindrical' || data.shape === 'tapered') {
            return data.diameterCm !== undefined
        }
        if (data.shape === 'rectangular') {
            return data.lengthCm !== undefined && data.widthCm !== undefined
        }
        return true
    },
    { message: 'Pot dimensions incomplete for selected shape' }
)

export const PotInfoSchema = z.object({
    dimensions: PotDimensionsSchema,
    hasDrainageHole: z.boolean(),
    material: z.enum(['terracotta', 'plastic', 'ceramic', 'fabric', 'other']).optional(),
})

export const PlantSizeSchema = z.enum(['seedling', 'small', 'medium', 'large'])

export const CareEventTypeSchema = z.enum([
    'watering', 'fertilizing', 'repotting', 'pruning', 'note'
])

// ─── Plant Schema ──────────────────────────────────────────────────────────────

export const PlantSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, 'Name is required').max(100),
    species: z.string().max(100).optional(),
    plantType: PlantTypeSchema,
    pot: PotInfoSchema,
    plantSize: PlantSizeSchema,
    sunlightLevel: SunlightLevelSchema,
    roomName: z.string().max(50).optional(),
    notes: z.string().max(500).optional(),
    imageUrl: z.string().url().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),

    wateringIntervalDays: z.number().int().min(1).max(365),
    fertilizingIntervalDays: z.number().int().min(1).max(365).optional(),
    repottingIntervalDays: z.number().int().min(1).max(3650).optional(),

    lastWateredAt: z.date().optional(),
    lastFertilizedAt: z.date().optional(),
    lastRepottedAt: z.date().optional(),
})

// ─── Form Schema (für AddPlant-Formular) ──────────────────────────────────────
// Abgeleitet vom PlantSchema — ohne auto-generierte Felder

export const PlantFormSchema = PlantSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
})

export const CareEventSchema = z.object({
    id: z.string().uuid(),
    plantId: z.string().uuid(),
    type: CareEventTypeSchema,
    performedAt: z.date(),
    notes: z.string().max(300).optional(),
    scheduledFor: z.date().optional(),
    earlyByDays: z.number().optional(),
})

// ─── Exported Types (von Zod abgeleitet) ──────────────────────────────────────
// Vorteil: Types und Validierung sind immer synchron!

export type PlantFormData = z.infer<typeof PlantFormSchema>
export type CareEventData = z.infer<typeof CareEventSchema>