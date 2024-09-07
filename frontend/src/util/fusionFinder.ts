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

function fuseTypes({ head, body }: FusionComponents): PokemonV1['types'] {
    const slot1Type = head.types[0].type
    const slot2Type = head.types[1] ? head.types[1].type : head.types[0].type

    // https://infinitefusion.fandom.com/wiki/Pok%C3%A9mon_Fusion#Typing
    // Dominant type clause
    // Pokemon with Normal/Flying type will always pass Flying

    return uniqBy(
        [
            ...head.types.map((t) => ({ ...t, from: head.name })),
            ...body.types.map((t) => ({ ...t, from: body.name })),
        ],
        'type',
    )
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

export const exportForTesting = {
    fuseStats,
    fuseMoves,
    fuseAbilities,
    fuseTypes,
    fuse,
}
