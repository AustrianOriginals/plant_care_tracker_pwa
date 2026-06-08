import type {PotDimensions} from '../types.ts'

/**
 * Berechnet das Substratvolumen in Liter
 * (reales Volumen × 0.85 da Erde nicht 100% des Raums füllt)
 */
export function calcPotVolumeLiters(dimensions: PotDimensions): number {
    const { shape, heightCm, diameterCm, lengthCm, widthCm } = dimensions
    let volumeCm3 = 0

    if (shape === 'cylindrical' && diameterCm) {
        const r = diameterCm / 2
        volumeCm3 = Math.PI * r * r * heightCm

    } else if (shape === 'rectangular' && lengthCm && widthCm) {
        volumeCm3 = lengthCm * widthCm * heightCm

    } else if (shape === 'tapered' && diameterCm) {
        // Kegelstumpf-Näherung: Oberdurchmesser, Unterdurchmesser ~75%
        const rTop = diameterCm / 2
        const rBottom = rTop * 0.75
        volumeCm3 = (Math.PI * heightCm / 3) * (rTop ** 2 + rTop * rBottom + rBottom ** 2)
    }

    return (volumeCm3 / 1000) * 0.85 // cm³ → Liter, × Füllgrad
}

/**
 * Basis-Gießintervall in Tagen basierend auf Volumen
 * Mehr Volumen = längeres Intervall (mehr Wasserspeicher)
 */
export function calcBaseWateringInterval(
    volumeLiters: number,
    hasDrainageHole: boolean,
    material: string = 'plastic'
): number {
    // Basis: ~1 Tag pro 0.3L Volumen
    let intervalDays = Math.round(volumeLiters / 0.3)

    // Drainage-Korrektur: ohne Loch → Erde bleibt länger feucht
    if (!hasDrainageHole) intervalDays = Math.round(intervalDays * 1.4)

    // Material-Korrektur
    if (material === 'terracotta') intervalDays = Math.round(intervalDays * 0.8)
    if (material === 'fabric')     intervalDays = Math.round(intervalDays * 0.75)
    if (material === 'ceramic')    intervalDays = Math.round(intervalDays * 1.1)

    // Sinnvolle Grenzen: min 2 Tage, max 30 Tage als Basiswert
    return Math.min(Math.max(intervalDays, 2), 30)
}