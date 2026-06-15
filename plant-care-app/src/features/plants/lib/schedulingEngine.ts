import type { Plant, CareEvent, NextCareSchedule } from '../types'
import { calcPotVolumeLiters, calcBaseWateringInterval } from './potCalculations'
import {
    SUNLIGHT_MULTIPLIER,
    PLANT_TYPE_MULTIPLIER,
    PLANT_SIZE_MULTIPLIER,
    ADAPTIVE_WEIGHT,
    MAX_ADAPTIVE_ADJUSTMENT_DAYS,
} from './schedulingConstants'

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

function daysBetween(a: Date, b: Date): number {
    return (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)
}

function addDays(date: Date, days: number): Date {
    const result = new Date(date)
    result.setDate(result.getDate() + Math.round(days))
    return result
}

// ─── Adaptiver Lernfaktor ─────────────────────────────────────────────────────

/**
 * Analysiert vergangene Care Events und berechnet wie viel früher/später
 * der User im Schnitt im Vergleich zum Plan gegossen hat.
 * Positiv = User gießt früher als berechnet
 * Negativ = User gießt später
 */
function calcAdaptiveAdjustment(
    recentEvents: CareEvent[],
    calculatedInterval: number
): number {
    const wateringEvents = recentEvents
        .filter(e => e.type === 'watering' && e.earlyByDays !== undefined)
        .slice(-5) // nur die letzten 5 Events berücksichtigen

    if (wateringEvents.length < 2) return 0 // zu wenig Daten

    const avgEarlyByDays =
        wateringEvents.reduce((sum, e) => sum + (e.earlyByDays ?? 0), 0) /
        wateringEvents.length

    // Adjustment begrenzen damit der Algorithmus nicht "übersteuert"
    const clampedAdjustment = Math.max(
        -MAX_ADAPTIVE_ADJUSTMENT_DAYS,
        Math.min(MAX_ADAPTIVE_ADJUSTMENT_DAYS, avgEarlyByDays)
    )

    return clampedAdjustment * ADAPTIVE_WEIGHT
}

// ─── Watering Interval Berechnung ─────────────────────────────────────────────

export function calcWateringInterval(plant: Plant): number {
    const volumeLiters = calcPotVolumeLiters(plant.pot.dimensions)

    const baseInterval = calcBaseWateringInterval(
        volumeLiters,
        plant.pot.hasDrainageHole,
        plant.pot.material
    )

    const adjustedInterval =
        baseInterval *
        SUNLIGHT_MULTIPLIER[plant.sunlightLevel] *
        PLANT_TYPE_MULTIPLIER[plant.plantType] *
        PLANT_SIZE_MULTIPLIER[plant.plantSize]

    return Math.max(1, Math.round(adjustedInterval))
}

// ─── Nächstes Gießdatum ───────────────────────────────────────────────────────

export function calcNextWateringDate(
    plant: Plant,
    recentEvents: CareEvent[]
): Date {
    const interval = calcWateringInterval(plant)
    const lastWatered = plant.lastWateredAt ?? plant.createdAt

    // Adaptiver Lernfaktor aus vergangenen Events
    const adaptiveAdjustment = calcAdaptiveAdjustment(recentEvents, interval)
    const adaptedInterval = Math.max(1, interval - adaptiveAdjustment)

    return addDays(lastWatered, adaptedInterval)
}

// ─── Urgency Score ────────────────────────────────────────────────────────────

/**
 * 0–100 Score für die Prioritätssortierung im Dashboard
 * 100 = sofort gießen, 0 = frisch gegossen
 */
function calcUrgencyScore(nextDate: Date, interval: number): number {
    const now = new Date()
    const daysUntil = daysBetween(now, nextDate)

    if (daysUntil <= 0) return 100                          // überfällig
    if (daysUntil >= interval) return 0                     // frisch gegossen

    // Lineare Interpolation zwischen 0 und 99
    return Math.round((1 - daysUntil / interval) * 99)
}

// ─── Haupt-Export ─────────────────────────────────────────────────────────────

export function calcNextCareSchedule(
    plant: Plant,
    recentEvents: CareEvent[]
): NextCareSchedule {
    const now = new Date()
    const nextWateringAt = calcNextWateringDate(plant, recentEvents)
    const wateringInterval = calcWateringInterval(plant)
    const daysUntilWatering = daysBetween(now, nextWateringAt)

    // Dünge- und Umtopf-Daten
    const nextFertilizingAt = plant.fertilizingIntervalDays && plant.lastFertilizedAt
        ? addDays(plant.lastFertilizedAt, plant.fertilizingIntervalDays)
        : undefined

    const nextRepottingAt = plant.repottingIntervalDays && plant.lastRepottedAt
        ? addDays(plant.lastRepottedAt, plant.repottingIntervalDays)
        : undefined

    return {
        plantId: plant.id,
        nextWateringAt,
        nextFertilizingAt,
        nextRepottingAt,
        urgencyScore: calcUrgencyScore(nextWateringAt, wateringInterval),
    }
}