import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert'

import MOVE_NAME_TO_ID from '../out/move-name-to-id.json'

const CSV_FILE_PATH = path.resolve(__dirname, '../in/infinite-fusion-list-of-tutors-6.2.3.csv')
const OUTPUT_JSON_PATH = path.resolve(__dirname, '../out/tutor-moves.json')

type TutorEntry = {
    full_move_name: string
    location: string
    additional_info: string
    price: string

    move_name?: string
    move_id?: number
}

async function parseCSVToJson() {
    try {
        const data = await fs.promises.readFile(CSV_FILE_PATH, 'utf-8')
        const lines = data.split('\n')
        const headers = lines[0].split('\t')
        let results: TutorEntry[] = []
        for (const line of lines.slice(1)) {
            const values = line.split('\t')
            if (values.includes('Move Deleter')) {
                continue
            }
            let entry: Partial<TutorEntry> = {}
            headers.forEach((header, index) => {
                entry[header] = values[index]
            })
            results.push(entry as TutorEntry)
        }

        // Populate with move info
        for (const [moveName, { id, full_name }] of Object.entries(MOVE_NAME_TO_ID)) {
            let moveEntry = results.find((result) => result['full_move_name'] === full_name)
            if (!moveEntry) {
                continue
            }
            moveEntry.move_name = moveName
            moveEntry.move_id = id
        }
        assert(
            results.every((result) => result.move_name && result.move_id),
            'The following entries are missing move info:' +
                results
                    .filter((result) => !result.move_name || !result.move_id)
                    .map((m) => m.full_move_name)
                    .join(', '),
        )

        await fs.promises.writeFile(OUTPUT_JSON_PATH, JSON.stringify(results, null, 2))
        console.log('CSV file successfully processed and saved as JSON.')
    } catch (error) {
        console.error('Error processing CSV file:', error)
    }
}

parseCSVToJson()
