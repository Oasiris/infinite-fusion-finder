import path from 'node:path'
import fs from 'node:fs'
import { awaitPrompt, sleep } from './util'

const IN_EXTRA_POKEMON = path.resolve(__dirname, '../in/extra_pokemon.txt')
const OUT_POKEMON_SPECIES_DIR = path.resolve(__dirname, '../out/api-pokemon-species')

const POKEAPI_URL = 'https://pokeapi.co/api/v2'

async function main(): Promise<void> {
    // Figure out pokemon numbers to fetch
    const pokedexNums = []
    for (let i = 1; i <= 251; i++) {
        pokedexNums.push(i)
    }

    // Read extra_pokemon.txt
    if (!fs.existsSync(IN_EXTRA_POKEMON)) {
        throw new Error('File extra_pokemon.txt not found!')
    }
    const extraPokemon = fs
        .readFileSync(IN_EXTRA_POKEMON, 'utf-8')
        .split('\n')
        .map((str) => str.trim().toLowerCase())
        .filter((str) => str.length > 0)
        .filter((str) => !str.startsWith('#'))
        .map((str) => encodeURIComponent(str))
    pokedexNums.push(...extraPokemon)

    console.log(pokedexNums.join(', '))
    console.log('Total entries:', pokedexNums.length)
    await awaitPrompt('Press Enter to fetch the first pokemon entry, ' + pokedexNums[0] + ':')

    // Fetch pokemon entries
    for (let idx in pokedexNums) {
        const idOrName = pokedexNums[idx]
        const filename = path.join(OUT_POKEMON_SPECIES_DIR, `${idOrName}.json`)
        if (fs.existsSync(filename)) {
            console.log(`File ${filename} already exists. Skipping fetch.`)
            continue
        }
        // Fetch
        const idURL = POKEAPI_URL + `/pokemon-species/${idOrName}`
        console.log(`(${Number(idx) + 1}/${pokedexNums.length}) Fetching ${idOrName}...`)
        const response = await fetch(idURL)
        const data = await response.json()
        fs.writeFileSync(filename, JSON.stringify(data, null, 2))
        await sleep(1000)
    }
}

main()
