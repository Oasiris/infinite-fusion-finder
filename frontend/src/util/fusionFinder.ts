// MOVES: As long as either pokemon has access to the move, the fusion has the move.
// ABILITIES: As long as either pokemon has access to the ability, the fusion has the ability.

import { PokemonV1 } from '../data/pokemon-data'
import { uniqBy } from 'lodash'

type FusionComponents = {
    head: PokemonV1
    body: PokemonV1
}

function fuseStats({ head, body }: FusionComponents): PokemonV1['stats'] {
    return {
        hp: (2 * head.stats.hp + body.stats.hp) / 3,
        attack: (head.stats.attack + 2 * body.stats.attack) / 3,
        defense: (head.stats.defense + 2 * body.stats.defense) / 3,
        specialAttack: (2 * head.stats.specialAttack + body.stats.specialAttack) / 3,
        specialDefense: (2 * head.stats.specialDefense + body.stats.specialDefense) / 3,
        speed: (head.stats.speed + 2 * body.stats.speed) / 3,
    }
}

function fuseMoves({ head, body }: FusionComponents): PokemonV1['moves'] {
    return {
        // TODO: Always show the earliest level at which the move is learned
        levelup: uniqBy([...head.moves.levelup, ...body.moves.levelup], 'name'),
        machine: uniqBy([...head.moves.machine, ...body.moves.machine], 'name'),
        tutor: uniqBy([...head.moves.tutor, ...body.moves.tutor], 'name'),
        egg: uniqBy([...head.moves.egg, ...body.moves.egg], 'name'),
    }
}

function fuseAbilities({ head, body }: FusionComponents): PokemonV1['abilities'] {
    return uniqBy(
        [
            ...head.abilities.map((a) => ({ ...a, from: head.name })),
            ...body.abilities.map((a) => ({ ...a, from: body.name })),
        ],
        'ability',
    )
}

function isTypeNormalFlying(pokemon: PokemonV1) {
    return (
        pokemon.types.map((t) => t.type).includes('normal') &&
        pokemon.types.map((t) => t.type).includes('flying')
    )
}

function fuseTypes({ head, body }: FusionComponents): PokemonV1['types'] {
    let slot1Type = head.types[0].type
    let slot2Type = body.types[1] ? body.types[1].type : body.types[0].type

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
        slot2Type = body.types[0].type
    }

    const fusedTypes = [{ slot: 1, type: slot1Type }]
    if (slot2Type !== slot1Type) {
        fusedTypes.push({ slot: 2, type: slot2Type })
    }
    return fusedTypes
}

export function fuse({ head, body }: FusionComponents): PokemonV1 {
    return {
        version: 1,
        type: 'pokemon',
        ifDex: 0,
        nationalDex: 0,
        name: '',
        stats: fuseStats({ head, body }),
        moves: fuseMoves({ head, body }),
        abilities: fuseAbilities({ head, body }),
        types: fuseTypes({ head, body }),
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
    name?: string
}

export function findFusionsV1(filterOptions: FusionFilterOptionsV1, data: PokemonV1[]): Combo[] {
    const allDexNums = data.map((pokemon) => pokemon.ifDex)
    let combos = []
    for (let i = 0; i < allDexNums.length; i++) {
        for (let j = 0; j < allDexNums.length; j++) {
            combos.push([allDexNums[i], allDexNums[j]] as Combo)
        }
    }

    // Apply filters in the following order:

    // 1. Use the most restrictive filters first
    // 2. Use the filter that is the most inclusive next
    // 3. Use the most complex filters last

    if (filterOptions.name) {
        // Filter by name
    }

    const matchesName = data.filter((pokemon) => pokemon.name === filterOptions.name)
    if (matchesName.length > 0) {
        // Filter out all combos that do not include the pokemon with the matching name
        combos = combos.filter(([head, body]) => {
            return matchesName.some((pokemon) => pokemon.ifDex === head || pokemon.ifDex === body)
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
