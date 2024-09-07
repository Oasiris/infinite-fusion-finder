import path from 'node:path'
import fs from 'node:fs/promises'
import assert from 'node:assert'

import { ascend } from 'ramda'

const inAscendingOrderByName = ascend((obj: { name: string }) => obj.name)
const byTMID = (a: { tm_id?: string }, b: { tm_id?: string }) => a.tm_id!.localeCompare(b.tm_id)

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
    tm_id?: string

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
import versionGroups from '../in/version-groups.json'
import tutorMoves from '../out/tutor-moves.json'
import machineMoves from '../out/machines.json'

const tutorMoveNames = tutorMoves.map((move) => move.move_name)
const machineMoveNames = machineMoves.map((move) => move.move_name)

const gen2To7VersionGroupNames = versionGroups
    .filter((g) => g.generation >= 2 && g.generation <= 7)
    .map((g) => g.name)

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

// Level-up moves from USUM
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

// Assume moves that could be learned by any method in any generation (until USUM) are valid machine moves

// NOTE: This assumption is not always correct. For example, Bulbasaur could learn Reflect in Gen 1 by TM, but not since
// then, so Bulbasaur cannot learn Reflect via TM in PIF.
// On the other hand, Hone Claws was a TM in Gen 5/6 but not in Gen 7, but Charmander _can_ learn Hone Claws via machine in PIF.
// As a simple heuristic, just ignore gen 1 for now.

bulbasaur.moves.machine = pokemon01.moves
    .filter((move) => machineMoves.some((m) => m.move_name === move.move.name))
    .filter((move) =>
        move.version_group_details.some((d) =>
            gen2To7VersionGroupNames.includes(d.version_group.name),
        ),
    )
    .map((move) => ({
        name: move.move.name,
        learn_method: 'machine',
        tm_id: machineMoves.find((m) => m.move_name === move.move.name)?.tm_id,
    }))
bulbasaur.moves.machine.sort(byTMID)

// Assume same for tutor moves
bulbasaur.moves.tutor = pokemon01.moves
    .filter((move) => tutorMoveNames.includes(move.move.name))
    .filter((move) =>
        move.version_group_details.some((d) =>
            gen2To7VersionGroupNames.includes(d.version_group.name),
        ),
    )
    .map((move) => ({
        name: move.move.name,
        learn_method: 'tutor',
    }))
bulbasaur.moves.tutor.sort(inAscendingOrderByName)

// Copy USUM egg moves
bulbasaur.moves.egg = pokemon01.moves
    .filter((move) =>
        move.version_group_details.some(
            (versionGroupDetail) =>
                versionGroupDetail.version_group.name === 'ultra-sun-ultra-moon' &&
                versionGroupDetail.move_learn_method.name === 'egg',
        ),
    )
    .map((move) => ({
        name: move.move.name,
        learn_method: 'egg',
    }))
bulbasaur.moves.egg.sort(inAscendingOrderByName)

console.log(JSON.stringify(bulbasaur, null, 4))
