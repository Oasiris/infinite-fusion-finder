// Map National Dex to IF Dex
// First, build a map from pokemon name to its NatDex Number (using out/pokemon-entries)
// Then, build a map from pokemon name to its IF Dex Number (using extra_pokemon.txt)

import path from 'node:path'
import fs from 'node:fs/promises'

import { globby } from 'globby'

const POKEMON_SPECIES_DIR = path.resolve(__dirname, '../out/api-pokemon-species')
const EXTRA_POKEMON_NAMES = path.resolve(__dirname, '../in/extra_pokemon_names.txt')

const OUT_FILE = path.resolve(__dirname, '../out/natdex-to-ifdex.json')

async function main(): Promise<void> {
    // 1. Build map from pokemon name to its NatDex Number
    // Read all files in POKEMON_ENTRIES_DIR using globby
    let files: string[]
    try {
        files = await globby(`${POKEMON_SPECIES_DIR}/*.json`)
        console.log('Files:', files)
    } catch (error) {
        console.error('Error reading files:', error)
    }

    let nameToNatDex: Record<string, number> = {}

    for (const file of files) {
        // Read file and parse JSON to object
        const text = await fs.readFile(file, 'utf-8')
        const pokemon = JSON.parse(text)
        nameToNatDex[pokemon.name] = pokemon.id
    }
    console.log(JSON.stringify(nameToNatDex))

    // 2. Build map from pokemon name to its IF Dex Number
    // Skip 1-251
    // Read extra_pokemon_names.txt
    const extraPokemonText = await fs.readFile(EXTRA_POKEMON_NAMES, 'utf-8')
    const extraPokemonNames = extraPokemonText
        .split('\n')
        .map((str) => str.trim().toLowerCase())
        .filter((str) => str.length > 0)
        .filter((str) => !str.startsWith('#'))

    const startingNum = 252

    let nameToIFDex: Record<string, number> = {}

    for (let i in extraPokemonNames) {
        const ifDexNum = Number(i) + startingNum
        const name = extraPokemonNames[i]
        if (name === 'skip') {
            continue
        }
        nameToIFDex[extraPokemonNames[i]] = ifDexNum
    }

    console.log(nameToIFDex)

    // 3. Build map from NatDex to IF Dex
    let natDexToIFDex: Record<number, number> = {}
    for (let i = 1; i <= 251; i++) {
        natDexToIFDex[i] = i
    }
    for (let name in nameToIFDex) {
        const natDexNum = nameToNatDex[name]
        const ifDexNum = nameToIFDex[name]
        natDexToIFDex[natDexNum] = ifDexNum
    }
    console.log('Entries:', Object.entries(natDexToIFDex).length)
    console.log(natDexToIFDex)

    // 4. Save
    await fs.writeFile(OUT_FILE, JSON.stringify(natDexToIFDex, null, 2))
}

main()
