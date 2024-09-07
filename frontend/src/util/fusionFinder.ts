// MOVES: As long as either pokemon has access to the move, the fusion has the move.
// ABILITIES: As long as either pokemon has access to the ability, the fusion has the ability.

import { PokemonV1 } from '../data/pokemon-data'
import { uniqBy } from 'lodash'

const uniqByName = <T extends { name: string }>(arr: T[]) => uniqBy(arr, (v) => v.name)

type FusionComponents<T> = {
    head: T
    body: T
}

function fuseStats({
    head: { stats: head },
    body: { stats: body },
}: FusionComponents<PokemonV1>): PokemonV1['stats'] {
    return {
        hp: (2 * head.hp + body.hp) / 3,
        attack: (head.attack + 2 * body.attack) / 3,
        defense: (head.defense + 2 * body.defense) / 3,
        specialAttack: (2 * head.specialAttack + body.specialAttack) / 3,
        specialDefense: (2 * head.specialDefense + body.specialDefense) / 3,
        speed: (head.speed + 2 * body.speed) / 3,
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
        types.map((t) => t.type).includes('normal') && types.map((t) => t.type).includes('flying')
    )
}

function fuseTypes({
    head: { types: head },
    body: { types: body },
}: FusionComponents<PokemonV1>): PokemonV1['types'] {
    let slot1Type = head[0].type
    let slot2Type = body[1] ? body[1].type : body[0].type

    // https://infinitefusion.fandom.com/wiki/Pok%C3%A9mon_Fusion#Typing
    // Dominant type clause
    // Pokemon with Normal/Flying type will always attempt to pass Flying
    if (slot1Type !== 'flying' && isTypeNormalFlying(body)) {
        slot2Type = 'flying'
    }
    if (slot2Type !== 'flying' && isTypeNormalFlying(head)) {
        slot1Type = 'flying'
    }

    // Monotype head clause
    // If the head is already providing the element the body wants to provide,
    // the body will provide its primary type instead
    if (slot1Type === slot2Type) {
        slot2Type = body[0].type
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
}

type Combo = [number, number]

export function findFusions(filterOptions: FusionFilterOptions, data: PokemonV1[]): Combo[] {
    const allDexNums = data.map((pokemon) => pokemon.ifDex)

    // Apply filters in the following order:

    // 1. Use the most restrictive filters first
    // 2. Use the filter that is the most inclusive next
    // 3. Use the most complex filters last

    if (filterOptions.names.length > 0) {
        // Filter by names
    }

    return []
}

type FusionFilterOptionsV1 = {
    names?: string[]
}

export function findFusionsV1(filterOptions: FusionFilterOptionsV1, data: PokemonV1[]): Combo[] {
    const { names = [] } = filterOptions

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

    // Filter types

    return combos
}

export const exportForTesting = {
    fuseStats,
    fuseMoves,
    fuseAbilities,
    fuseTypes,
    fuse,
}
