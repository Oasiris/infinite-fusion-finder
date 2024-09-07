import path from 'node:path'
import fs from 'node:fs/promises'
import assert from 'node:assert'

// In V1 let's just ignore different forms
type PokemonV1 = {
    version: 1 | number
    type: 'pokemon' | string
    nationalDex: number
    ifDex: number

    // Optional. Certain Pokemon have multiple dex numbers, 1 for each form
    ifDexList?: number[]

    types: PokemonType[]

    stats: {
        hp: number
        attack: number
        defense: number
        specialAttack: number
        specialDefense: number
        speed: number
    }

    abilities_normal: PokemonAbility[]
    abilities_hidden: PokemonAbility[]

    moves: {
        levelup: PokemonMove[]
        machine: PokemonMove[]
        tutor: PokemonMove[]
        egg: PokemonMove[]
    }
}

type PokemonAbility = {
    slot: 1 | 2 | 'hidden' | number | string
    ability: string

    // Can be hydrated with ability data
    abilityV1?: AbilityV1
}

type PokemonType = {
    slot: 1 | 2 | number
    type: string

    // Can be hydrated with type data
    typeV1?: TypeV1
}

type PokemonMove = {
    name: string
    learn_method: 'levelup' | 'machine' | 'tutor' | 'egg' | string
    level?: number

    // Can be hydrated with move data
    moveV1?: MoveV1
}

type AbilityV1 = { name: string }
type TypeV1 = { name: string }
type MoveV1 = {
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

// Start by building this for Bulbasaur

// const BULBASAUR_POKEMON_DIR = path.resolve(__dirname, '../out/api-pokemon/1.json')
// const BULBASAUR_POKEMON_SPECIES_DIR = path.resolve(__dirname, '../out/api-pokemon-species/001.json')
// const NATDEX_TO_IFDEX_DIR = path.resolve(__dirname, '../out/natdex-to-ifdex.json')

import pokemon01 from '../out/api-pokemon/1.json'
import pokemonSpecies01 from '../out/api-pokemon-species/1.json'
import natDexToIFDex from '../out/natdex-to-ifdex.json'

// const pokemon01Text = await fs.readFile(BULBASAUR_POKEMON_DIR, 'utf-8')
// const pokemon01 = JSON.parse(pokemon01Text)
// const pokemonSpeciesText = await fs.readFile(BULBASAUR_POKEMON_SPECIES_DIR, 'utf-8')
// const pokemonSpecies01 = JSON.parse(pokemonSpeciesText)
// const natdexToIFDexText = await fs.readFile(NATDEX_TO_IFDEX_DIR, 'utf-8')
// const natdexToIFDex = JSON.parse(natdexToIFDexText)

let bulbasaur: Partial<PokemonV1> = { version: 1, type: 'pokemon' }
bulbasaur.nationalDex = pokemonSpecies01.id
bulbasaur.ifDex = natDexToIFDex[pokemon01.id]
assert(bulbasaur.ifDex !== undefined)

bulbasaur.types = pokemon01.types.map((type: { slot: number; type: { name: string } }) => ({
    slot: type.slot,
    type: type.type.name,
}))

bulbasaur.stats = {
    hp: pokemon01.stats[0].base_stat,
    attack: pokemon01.stats[1].base_stat,
    defense: pokemon01.stats[2].base_stat,
    specialAttack: pokemon01.stats[3].base_stat,
    specialDefense: pokemon01.stats[4].base_stat,
    speed: pokemon01.stats[5].base_stat,
}

bulbasaur.abilities_normal = pokemon01.abilities
    .filter((ability: { is_hidden: boolean }) => !ability.is_hidden)
    .map((ability: { ability: { name: string }; slot: number }) => ({
        slot: ability.slot,
        ability: ability.ability.name,
    }))

bulbasaur.abilities_hidden = pokemon01.abilities
    .filter((ability: { is_hidden: boolean }) => ability.is_hidden)
    .map((ability: { ability: { name: string } }) => ({
        slot: 'hidden',
        ability: ability.ability.name,
    }))

// Start with the level-up moves
bulbasaur.moves = { levelup: [], machine: [], tutor: [], egg: [] }
bulbasaur.moves.levelup = pokemon01.moves
    .filter((move) =>
        move.version_group_details.some(
            (versionGroupDetail) =>
                versionGroupDetail.version_group.name === 'ultra-sun-ultra-moon' &&
                versionGroupDetail.move_learn_method.name === 'level-up',
        ),
    )
    .map((move) => ({
        name: move.move.name,
        learn_method: 'levelup',
        level: move.version_group_details.find(
            (versionGroupDetail) =>
                versionGroupDetail.version_group.name === 'ultra-sun-ultra-moon',
        )?.level_learned_at,
    }))
// Sort level-up moves by level
bulbasaur.moves.levelup.sort((a, b) => {
    if (a.level === b.level) {
        return a.name.localeCompare(b.name)
    }
    return a.level - b.level
})

console.log(JSON.stringify(bulbasaur, null, 4))
