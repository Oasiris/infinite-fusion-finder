import path from 'node:path'
import fs from 'node:fs/promises'
import assert from 'node:assert'

// @ts-expect-error moduleResolution:nodenext issue 52529
import { globby } from 'globby'
import { ascend } from 'ramda'

const inAscendingOrderByName = ascend((obj: { name: string }) => obj.name)
const inAscendingOrderByIFDex = ascend((obj: { ifDex: number }) => obj.ifDex)
const byTMID = (a: { tm_id?: string }, b: { tm_id?: string }) => a.tm_id!.localeCompare(b.tm_id)

import { PokemonV1 } from './models/pokemon'

import natDexToIFDex from '../out/natdex-to-ifdex.json'
import versionGroups from '../in/version-groups.json'
import tutorMoves from '../out/tutor-moves.json'
import machineMoves from '../out/machines.json'

const tutorMoveNames = tutorMoves.map((move) => move.move_name)

const gen2To7VersionGroupNames = versionGroups
    .filter((g) => g.generation >= 2 && g.generation <= 7)
    .map((g) => g.name)

const API_POKEMON_DIR = path.resolve(__dirname, '../out/api-pokemon')
const OUT_POKEMON_DIR = path.resolve(__dirname, '../out/pokemon')
const OUT_POKEMON_INDEX_PATH = path.resolve(__dirname, '../out/pokemon-index.json')

async function readAPIPokemonEntries(): Promise<any[]> {
    let apiEntries = []

    // Import everything in out/api-pokemon
    let files: string[]
    try {
        files = await globby(`${API_POKEMON_DIR}/*.json`)
        console.log('Files:', files)
    } catch (error) {
        console.error('Error reading files:', error)
    }
    for (const file of files) {
        try {
            const apiEntry = JSON.parse(await fs.readFile(file, 'utf-8'))
            const natDexID = apiEntry.id
            if (natDexToIFDex[natDexID] === undefined) {
                continue
            }
            apiEntries.push(apiEntry)
        } catch (error) {
            console.error('Error reading file:', error)
        }
    }
    return apiEntries
}

async function buildPokemonEntryV1(data): Promise<PokemonV1> {
    let entry: Partial<PokemonV1> = {
        version: 1,
        type: 'pokemon',
        name: data.name,
        nationalDex: data.id,
        ifDex: natDexToIFDex[data.id],
    }
    assert(entry.ifDex !== undefined)

    entry.types = data.types.map((type: { slot: number; type: { name: string } }) => ({
        slot: type.slot,
        type: type.type.name,
    }))

    entry.stats = {
        hp: data.stats[0].base_stat,
        attack: data.stats[1].base_stat,
        defense: data.stats[2].base_stat,
        specialAttack: data.stats[3].base_stat,
        specialDefense: data.stats[4].base_stat,
        speed: data.stats[5].base_stat,
    }

    entry.abilities = data.abilities.map(
        (ability: { slot: number; is_hidden: boolean; ability: { name: string } }) => ({
            slot: ability.is_hidden ? 'hidden' : ability.slot,
            ability: ability.ability.name,
        }),
    )

    entry.moves = { levelup: [], machine: [], tutor: [], egg: [] }
    entry.moves.levelup = data.moves
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
    entry.moves.levelup.sort((a, b) => {
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

    entry.moves.machine = data.moves
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
    entry.moves.machine.sort(byTMID)

    // Assume same for tutor moves
    entry.moves.tutor = data.moves
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
    entry.moves.tutor.sort(inAscendingOrderByName)

    // Copy USUM egg moves
    entry.moves.egg = data.moves
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
    entry.moves.egg.sort(inAscendingOrderByName)

    return entry as PokemonV1
}

async function postProcessPokemonEntryV1(entry: PokemonV1): Promise<PokemonV1> {
    // Label not-yet-implemented Pokemon
    const NOT_YET_IMPLEMENTED_DEX_IDS = [
        470, 471, 472, 473, 474, 475, 476, 477, 478, 479, 480, 481, 482, 483, 484, 485, 486, 487,
    ]
    if (NOT_YET_IMPLEMENTED_DEX_IDS.includes(entry.nationalDex)) {
        entry.notYetImplemented = true
    }
    return entry
}

async function main() {
    const apiEntries = await readAPIPokemonEntries()

    // Make destination folder if it doesn't exist
    try {
        await fs.mkdir(OUT_POKEMON_DIR, { recursive: true })
    } catch (error) {
        console.error('Error creating destination folder:', error)
    }

    console.log('Parsing', apiEntries.length, 'pokemon entries...')
    let allPokemonData = []
    for (const data of apiEntries) {
        let pokemon = await buildPokemonEntryV1(data)
        pokemon = await postProcessPokemonEntryV1(pokemon)

        const outPath = path.resolve(OUT_POKEMON_DIR, `${pokemon.ifDex}.json`)
        await fs.writeFile(outPath, JSON.stringify(pokemon, null, 4))

        allPokemonData.push(pokemon)
    }
    allPokemonData.sort(inAscendingOrderByIFDex)

    // Write Pokemon index
    await fs.writeFile(OUT_POKEMON_INDEX_PATH, JSON.stringify(allPokemonData))
}

main()
