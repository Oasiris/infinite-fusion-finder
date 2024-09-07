import * as fs from 'node:fs'
import * as path from 'node:path'

import { prompt } from '../util'

const OUT_MOVE_DIR = path.join(__dirname, '../../out/api-move')
const OUT_MOVE_NAME_TO_ID_PATH = path.join(__dirname, '../../out/move-name-to-id.json')
const BASE_URL = 'https://pokeapi.co/api/v2/move/'
const TOTAL_MOVES = 937 // Total: 937
const DELAY_MS = 1500

async function fetchMove(id: number): Promise<any> {
    try {
        const response = await fetch(`${BASE_URL}${id}/`)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error(`Error fetching move with ID ${id}:`, error)
        return null
    }
}

async function saveMove(move: any, id: number) {
    const fileName = path.join(OUT_MOVE_DIR, `${id}.json`)
    const fileData = JSON.stringify(move)
    fs.writeFileSync(fileName, fileData)
}

async function fetchAllMoves(): Promise<
    [any[], Record<string, { id: number; full_name: string }>]
> {
    const moves = []
    const moveNameToID: Record<string, { id: number; full_name: string }> = {}
    for (let id = 1; id <= TOTAL_MOVES; id++) {
        const fileName = path.join(OUT_MOVE_DIR, `${id}.json`)
        if (fs.existsSync(fileName)) {
            console.log(`Skipping existing move ${id}.json...`)
            // Read the file and add it to the moves array and moveNameToID
            const data = fs.readFileSync(fileName, 'utf-8')
            const move = JSON.parse(data)
            moves.push(move)
            moveNameToID[move.name] = {
                id: id,
                full_name: move.names.find((m) => m.language.name === 'en').name,
            }
            continue
        }
        console.log(`Fetching move ${id}/${TOTAL_MOVES}...`)
        const move = await fetchMove(id)
        moves.push(move)
        moveNameToID[move.name] = {
            id: id,
            full_name: move.names.find((m) => m.language.name === 'en').name,
        }
        await saveMove(move, id)
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS))
    }
    return [moves, moveNameToID]
}

async function main() {
    if (!fs.existsSync(OUT_MOVE_DIR)) {
        fs.mkdirSync(OUT_MOVE_DIR, { recursive: true })
    }
    console.log('Total entries:', TOTAL_MOVES)
    await prompt('Press Enter to proceed fetching ' + TOTAL_MOVES + ' moves: ')

    const [allMoves, moveNameToID] = await fetchAllMoves()
    console.log('Saved all', allMoves.length, 'moves to:', OUT_MOVE_DIR)
    // Save moveNameToID to a file
    fs.writeFileSync(OUT_MOVE_NAME_TO_ID_PATH, JSON.stringify(moveNameToID, null, 2))
    console.log('Move name to ID mapping saved to:', OUT_MOVE_NAME_TO_ID_PATH)
}

main()
