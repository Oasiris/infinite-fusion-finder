import * as fs from 'node:fs'
import * as path from 'node:path'
import assert from 'node:assert'

import { globby } from 'globby'

import { prompt } from './util'

import { ascendNatural, identity } from 'ramda'

// Comparator that sorts strings in ascending natural (human) order
const inAscendingNaturalOrder = ascendNatural('en', identity)

const OUT_MOVE_DIR = path.join(__dirname, '../out/api-move')
const OUT_MOVE_NAME_TO_ID_PATH = path.join(__dirname, '../out/move-name-to-id.json')
const BASE_URL = 'https://pokeapi.co/api/v2/move?limit=200'
const DELAY_MS = 1000

type APIMoveList = {
    count: number
    next: string
    previous: string
    results: { name: string; url: string }[]
}

async function fetchMove(url: string): Promise<any> {
    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error(`Error fetching move:`, error)
        return null
    }
}

async function saveMove(move: any, id: number) {
    const fileName = path.join(OUT_MOVE_DIR, `${id}.json`)
    const fileData = JSON.stringify(move)
    fs.writeFileSync(fileName, fileData)
}

async function fetchAndSaveMoves(): Promise<any[]> {
    const newMoves = []
    let url = BASE_URL

    do {
        const response = await fetch(url)
        const data = (await response.json()) as APIMoveList
        console.log('Response fetched. URL:', url)

        for (const move of data.results) {
            const id = move.url.match(/\/(\d+)\/$/)?.[1]
            assert(id, 'Move ID not found in URL: ' + move.url + ' from call: ' + url)

            // Skip if file already exists
            const fileName = path.join(OUT_MOVE_DIR, `${id}.json`)
            if (fs.existsSync(fileName)) {
                console.log(`File ${fileName} already exists. Skipping fetch.`)
                continue
            }

            console.log(`Fetching move ${id}...`)
            const moveData = await fetchMove(move.url)
            await saveMove(moveData, moveData.id)
            await new Promise((resolve) => setTimeout(resolve, DELAY_MS))
        }

        url = data.next
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS))
    } while (url)

    return newMoves
}

async function main() {
    if (!fs.existsSync(OUT_MOVE_DIR)) {
        fs.mkdirSync(OUT_MOVE_DIR, { recursive: true })
    }

    console.log('Fetching moves...')
    await prompt('Press Enter to proceed fetching moves: ')

    await fetchAndSaveMoves()
    console.log('Saved all moves to:', OUT_MOVE_DIR)

    // Generate moveNameToID mapping
    const moveNameToID: Record<string, { id: number; full_name: string }> = {}
    const files = await globby(`${OUT_MOVE_DIR}/*.json`)
    files.sort(inAscendingNaturalOrder)
    for (const file of files) {
        const moveData = JSON.parse(fs.readFileSync(file, 'utf-8'))
        let moveFullName = moveData.names.find((m: any) => m.language.name === 'en')?.name
        if (!moveFullName) {
            console.error('Missing full name for move:', moveData.name)
            continue
        }
        moveNameToID[moveData.name] = {
            id: moveData.id,
            full_name: moveData.names.find((m: any) => m.language.name === 'en').name,
        }
    }

    // Save moveNameToID to a file
    fs.writeFileSync(OUT_MOVE_NAME_TO_ID_PATH, JSON.stringify(moveNameToID, null, 2))
    console.log('Move name to ID mapping saved to:', OUT_MOVE_NAME_TO_ID_PATH)
}

main()
