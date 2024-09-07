// NOTE: PokemonV1 has no data for different forms (for Meloetta, etc.)
export type PokemonV1 = {
    version: 1 | number
    type: 'pokemon' | string
    name: string
    nationalDex: number
    ifDex: number

    // Optional. Certain Pokemon have multiple dex numbers, 1 for each form
    ifDexList?: number[]

    // Optional. Certain Pokemon aren't yet implemented
    notYetImplemented?: true | boolean

    types: PokemonType[]

    stats: {
        hp: number
        attack: number
        defense: number
        specialAttack: number
        specialDefense: number
        speed: number
    }

    abilities: PokemonAbility[]

    moves: {
        levelup: PokemonMove[]
        machine: PokemonMove[]
        tutor: PokemonMove[]
        egg: PokemonMove[]
    }
}

export type PokemonAbility = {
    slot: 1 | 2 | 'hidden' | number | string
    ability: string

    // Can be hydrated with ability data
    abilityV1?: AbilityV1
}

export type PokemonType = {
    slot: 1 | 2 | number
    type: string

    // Can be hydrated with type data
    typeV1?: TypeV1
}

export type PokemonMove = {
    name: string
    learn_method: 'levelup' | 'machine' | 'tutor' | 'egg' | string
    level?: number
    tm_id?: string

    // Can be hydrated with move data
    moveV1?: MoveV1
}
export type MoveV1 = {
    version: 1 | number
    type: 'move' | string
    name: string
    moeType: string
    category: 'physical' | 'special' | 'status' | string
    power: number
    accuracy: number
    effect_pct_chance: number
    pp: number
    description: string
}

// TODO: Implement
export type AbilityV1 = { name: string }
export type TypeV1 = { name: string }
