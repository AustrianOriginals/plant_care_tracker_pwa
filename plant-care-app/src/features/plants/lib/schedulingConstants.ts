import type { PlantType, SunlightLevel, PlantSize } from '../types'

// Wie stark beeinflusst Sonneneinstrahlung die Verdunstung?
export const SUNLIGHT_MULTIPLIER: Record<SunlightLevel, number> = {
    full_sun:    0.7,
    partial_sun: 0.85,
    indirect:    1.0,   // Basis
    low_light:   1.25,
}

// Wie viel Wasser verbraucht jeder Pflanzentyp relativ?
export const PLANT_TYPE_MULTIPLIER: Record<PlantType, number> = {
    cactus:    2.5,   // braucht sehr wenig Wasser
    succulent: 2.0,
    tree:      1.2,
    herb:      0.8,
    tropical:  0.75,
    fern:      0.65,
    flowering: 0.85,
    other:     1.0,
}

// Größere Pflanzen verdunsten mehr
export const PLANT_SIZE_MULTIPLIER: Record<PlantSize, number> = {
    seedling: 1.3,   // kleines Volumen, trocknet schnell
    small:    1.1,
    medium:   1.0,   // Basis
    large:    0.85,  // mehr Blattmasse, aber auch mehr Substrat
}

// Wie stark fließt das bisherige Verhalten in die Anpassung ein?
// 0 = gar nicht, 1 = komplett
export const ADAPTIVE_WEIGHT = 0.3
export const MAX_ADAPTIVE_ADJUSTMENT_DAYS = 5