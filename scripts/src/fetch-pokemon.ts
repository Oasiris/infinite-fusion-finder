import path from 'node:path'
import fs from 'node:fs'
import { awaitPrompt } from './util'

const OUT_DIRECTORY = path.resolve(__dirname, '../out/pokemon-entries')
const POKEAPI_URL = 'https://pokeapi.co/api/v2'

async function main(): Promise<void> {
    // Figure out pokemon numbers to fetch
    const pokedexNums = []
    for (let i = 1; i <= 251; i++) {
        pokedexNums.push(i)
    }
    console.log(pokedexNums.join(', '))
    console.log('Total entries:', pokedexNums.length)
    await awaitPrompt('Press Enter to fetch the first pokemon entry, ' + pokedexNums[0] + ':')

    // Skip the first pokemon entry if it was already saved
    const id = pokedexNums[0]
    const filename = path.join(OUT_DIRECTORY, `${id}.json`)
    if (fs.existsSync(filename)) {
        console.log(`File ${filename} already exists. Skipping fetch.`)
        return
    }
    const idURL = POKEAPI_URL + `/pokemon/${id}`
    console.log(`Fetching ${idURL}...`)
    const response = await fetch(idURL)
    const data = await response.json()
    console.log(data)
    console.log('Saving to', filename)
    fs.writeFileSync(filename, JSON.stringify(data, null, 2))
}

main()
