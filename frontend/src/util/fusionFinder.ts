// MOVES: As long as either pokemon has access to the move, the fusion has the move.
// ABILITIES: As long as either pokemon has access to the ability, the fusion has the ability.

import { PokemonV1 } from '../data/pokemon-data'
import { uniqBy } from 'lodash'

const uniqByName = <T extends { name: string }>(arr: T[]) => uniqBy(arr, (v) => v.name)

type FusionComponents<T> = {
    head: T
    body: T
}

function lookup(data: PokemonV1[], { ifDex }: { ifDex: number }): PokemonV1 {
    if (ifDex > 470) {
        return data.find((pokemon) => pokemon.ifDex === ifDex) as PokemonV1
    }
    return data[ifDex - 1]
}

function fuseStats(comp: FusionComponents<PokemonV1>): PokemonV1['stats'] {
    return {
        hp: (2 * comp.head.stats.hp + comp.body.stats.hp) / 3,
        attack: (comp.head.stats.attack + 2 * comp.body.stats.attack) / 3,
        defense: (comp.head.stats.defense + 2 * comp.body.stats.defense) / 3,
        specialAttack: (2 * comp.head.stats.specialAttack + comp.body.stats.specialAttack) / 3,
        specialDefense: (2 * comp.head.stats.specialDefense + comp.body.stats.specialDefense) / 3,
        speed: (comp.head.stats.speed + 2 * comp.body.stats.speed) / 3,
    }
}

function fuseMoves({
    head: { moves: head },
    body: { moves: body },
}: FusionComponents<PokemonV1>): PokemonV1['moves'] {
    return {
        // TODO: Always show the earliest level at which the move is learned
        levelup: uniqByName([...head.levelup, ...body.levelup]),
        machine: uniqByName([...head.machine, ...body.machine]),
        tutor: uniqByName([...head.tutor, ...body.tutor]),
        egg: uniqByName([...head.egg, ...body.egg]),
    }
}

function fuseAbilities({
    head: { abilities: head, name: headName },
    body: { abilities: body, name: bodyName },
}: FusionComponents<PokemonV1>): PokemonV1['abilities'] {
    return uniqBy(
        [
            ...head.map((a) => ({ ...a, from: headName })),
            ...body.map((a) => ({ ...a, from: bodyName })),
        ],
        'ability',
    )
}

function isTypeNormalFlying(types: PokemonV1['types']) {
    return (
        types.length === 2 &&
        (types[0].type === 'normal' || types[1].type === 'normal') &&
        (types[0].type === 'flying' || types[1].type === 'flying')
    )
}

function fuseTypes(input: FusionComponents<PokemonV1>): PokemonV1['types'] {
    let slot1Type = input.head.types[0].type
    let slot2Type = input.body.types[1] ? input.body.types[1].type : input.body.types[0].type

    // https://infinitefusion.fandom.com/wiki/Pok%C3%A9mon_Fusion#Typing
    // Dominant type clause
    // Pokemon with Normal/Flying type will always attempt to pass Flying
    if (slot1Type !== 'flying' && isTypeNormalFlying(input.body.types)) {
        slot2Type = 'flying'
    }
    if (slot2Type !== 'flying' && isTypeNormalFlying(input.head.types)) {
        slot1Type = 'flying'
    }

    // Monotype head clause
    // If the head is already providing the element the body wants to provide,
    // the body will provide its primary type instead
    if (slot1Type === slot2Type) {
        slot2Type = input.body.types[0].type
    }

    const fusedTypes = [{ slot: 1, type: slot1Type }]
    if (slot2Type !== slot1Type) {
        fusedTypes.push({ slot: 2, type: slot2Type })
    }
    return fusedTypes
}

export function fuse(components: FusionComponents<PokemonV1>): PokemonV1 {
    return {
        version: 1,
        type: 'pokemon',
        ifDex: 0,
        nationalDex: 0,
        name: '',
        stats: fuseStats(components),
        moves: fuseMoves(components),
        abilities: fuseAbilities(components),
        types: fuseTypes(components),
    }
}

type FusionFilterOptions = {
    names: string[]
    types: string[]
    moves: string[]
    abilities: string[]
    minHp: number
    minAttack: number
    minDefense: number
    minSpecialAttack: number
    minSpecialDefense: number
    minSpeed: number
    minBST: number
}

type Combo = [number, number]

export function findFusions(_filterOptions: FusionFilterOptions, _data: PokemonV1[]): Combo[] {
    // TODO: implement
    console.log({ _filterOptions, _data })
    return []
}

type FusionFilterOptionsV1 = {
    names?: string[]
    moves?: string[]
    abilities?: string[]
    types?: string[]

    min?: {
        hp?: number
        attack?: number
        defense?: number
        specialAttack?: number
        specialDefense?: number
        speed?: number
        bst?: number
    }
}

export function findFusionsV1(filterOptions: FusionFilterOptionsV1, data: PokemonV1[]): Combo[] {
    const { names = [], abilities = [], moves = [], min = {}, types = [] } = filterOptions

    // Build all combos
    const allDexNums = data.map((pokemon) => pokemon.ifDex)
    let combos = []
    for (let i = 0; i < allDexNums.length; i++) {
        for (let j = 0; j < allDexNums.length; j++) {
            combos.push([allDexNums[i], allDexNums[j]] as Combo)
        }
    }

    // Filter names
    for (const name of names) {
        const filterMon = data.filter((pokemon) => pokemon.name === name)
        if (filterMon.length > 0) {
            // Filter out all combos that do not include the pokemon with the matching name
            combos = combos.filter(([head, body]) => {
                return filterMon.some((pokemon) => pokemon.ifDex === head || pokemon.ifDex === body)
            })
        }
    }

    for (const ability of abilities) {
        // Filter by ability
        // Find all pokemon with this ability
        const abilityMons = data.filter((pokemon) => {
            return pokemon.abilities.some((abilityEntry) => abilityEntry.ability === ability)
        })

        // Filter out all combos that do not include a pokemon with the matching ability
        combos = combos.filter(([head, body]) => {
            return abilityMons.some((pokemon) => pokemon.ifDex === head || pokemon.ifDex === body)
        })
    }

    for (const move of moves) {
        // Filter by move
        // Find all pokemon with this move
        const moveMons = data.filter((pokemon) => {
            return Object.values(pokemon.moves).some((moveList) => {
                return moveList.some((moveEntry) => moveEntry.name === move)
            })
        })

        // Filter out all combos that do not include a pokemon with the matching move
        combos = combos.filter(([head, body]) => {
            return moveMons.some((pokemon) => pokemon.ifDex === head || pokemon.ifDex === body)
        })
    }

    // Apply stat minimums
    const statKeys = [
        'hp',
        'attack',
        'defense',
        'specialAttack',
        'specialDefense',
        'speed',
    ] as const
    if (Object.keys(min).length > 0) {
        combos = combos.filter(([head, body]) => {
            const fusedStats = fuseStats({
                head: lookup(data, { ifDex: head }),
                body: lookup(data, { ifDex: body }),
            })

            for (const [key, minValue] of Object.entries(min)) {
                if (statKeys.includes(key as any)) {
                    if (fusedStats[key as keyof PokemonV1['stats']] < minValue) {
                        return false
                    }
                }
            }
            if (min.bst) {
                const bst = Object.values(fusedStats).reduce((acc, cur) => acc + cur)
                if (bst < min.bst) {
                    return false
                }
            }

            return true
        })
    }

    // Apply single-type constraint
    if (types.length === 1) {
        combos = combos.filter(([head, body]) => {
            const fusedTypes = fuseTypes({
                head: lookup(data, { ifDex: head }),
                body: lookup(data, { ifDex: body }),
            })
            return fusedTypes.some((type) => type.type === types[0])
        })
    } else if (types.length === 2) {
        combos = combos.filter(([head, body]) => {
            const fusedTypes = fuseTypes({
                head: lookup(data, { ifDex: head }),
                body: lookup(data, { ifDex: body }),
            })
            return (
                fusedTypes.length === 2 &&
                fusedTypes[0].type === types[0] &&
                fusedTypes[1].type === types[1]
            )
        })
    }

    return combos
}

export const exportForTesting = {
    fuseStats,
    fuseMoves,
    fuseAbilities,
    fuseTypes,
    fuse,
}
