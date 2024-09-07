import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert'

import uniqBy from 'lodash/uniqBy'

import MOVE_NAME_TO_ID from '../out/move-name-to-id.json'

const HMS_CSV_PATH = path.resolve(__dirname, '../in/infinite-fusion-list-of-hms-6.2.3.csv')
const TMS_CSV_PATH = path.resolve(__dirname, '../in/infinite-fusion-list-of-tms-6.2.3.csv')
const OUTPUT_JSON_PATH = path.resolve(__dirname, '../out/machines.json')

type MachineEntry = {
    machine_id: string
    full_move_name: string
    location: string
    location_name?: string
    location_additional_info?: string

    move_name?: string
    move_id?: number
}

async function parseTMsToJSON(): Promise<MachineEntry[]> {
    try {
        const data = await fs.promises.readFile(TMS_CSV_PATH, 'utf-8')
        const lines = data.split('\n')
        const headers = lines[0].split('\t')

        let results: MachineEntry[] = []
        for (const line of lines.slice(1)) {
            const values = line.split('\t')
            let entry: Partial<MachineEntry> = {}
            headers.forEach((header, index) => {
                if (header[0] === header.toUpperCase()[0]) {
                    return
                }
                entry[header] = values[index]
            })
            results.push(entry as MachineEntry)
        }
        return results
    } catch (error) {
        throw new Error('Error processing CSV file:' + error)
    }
}

async function parseHMsToJSON(): Promise<MachineEntry[]> {
    try {
        const data = await fs.promises.readFile(HMS_CSV_PATH, 'utf-8')
        const lines = data.split('\n')
        const headers = lines[0].split('\t')

        let results: MachineEntry[] = []
        for (const line of lines.slice(1)) {
            const values = line.split('\t')
            let entry: Partial<MachineEntry> = {}
            headers.forEach((header, index) => {
                if (header[0] === header.toUpperCase()[0]) {
                    return
                }
                entry[header] = values[index]
            })
            results.push(entry as MachineEntry)
        }
        return results
    } catch (error) {
        throw new Error('Error processing CSV file:' + error)
    }
}

async function main() {
    const tms = await parseTMsToJSON()
    const hms = await parseHMsToJSON()
    let machines = [...tms, ...hms]

    // Skip Fusion Beam in v1
    machines.splice(
        machines.findIndex((m) => m.full_move_name === 'Fusion Beam'),
        1,
    )

    // Dedupe entries
    machines = uniqBy(machines, (entry) => entry.full_move_name)

    // Populate with move info
    for (const [moveName, { id, full_name }] of Object.entries(MOVE_NAME_TO_ID)) {
        let moveEntry = machines.find((result) => result['full_move_name'] === full_name)
        if (!moveEntry) {
            continue
        }
        moveEntry.move_name = moveName
        moveEntry.move_id = id
    }
    assert(
        machines.every((result) => result.move_name && result.move_id),
        'The following entries are missing move info:' +
            machines
                .filter((result) => !result.move_name || !result.move_id)
                .map((m) => JSON.stringify(m))
                .join(', '),
    )

    await fs.promises.writeFile(OUTPUT_JSON_PATH, JSON.stringify(machines, null, 2))
    console.log('CSV file successfully processed and saved as JSON to', OUTPUT_JSON_PATH)
}

main()

// const CSV_FILE_PATH = path.resolve(__dirname, '../in/infinite-fusion-list-of-tutors-6.2.3.csv')
// const OUTPUT_JSON_PATH = path.resolve(__dirname, '../out/tutor-moves.json')

// type TutorEntry = {
//     full_move_name: string
//     location: string
//     additional_info: string
//     price: string

//     move_name?: string
//     move_id?: number
// }

// async function parseCSVToJson() {
//     try {
//         const data = await fs.promises.readFile(CSV_FILE_PATH, 'utf-8')
//         const lines = data.split('\n')
//         const headers = lines[0].split('\t')
//         let results: TutorEntry[] = []
//         for (const line of lines.slice(1)) {
//             const values = line.split('\t')
//             if (values.includes('Move Deleter')) {
//                 continue
//             }
//             let entry: Partial<TutorEntry> = {}
//             headers.forEach((header, index) => {
//                 entry[header] = values[index]
//             })
//             results.push(entry as TutorEntry)
//         }

//         // Populate with move info
//         for (const [moveName, { id, full_name }] of Object.entries(MOVE_NAME_TO_ID)) {
//             let moveEntry = results.find((result) => result['full_move_name'] === full_name)
//             if (!moveEntry) {
//                 continue
//             }
//             moveEntry.move_name = moveName
//             moveEntry.move_id = id
//         }
//         assert(
//             results.every((result) => result.move_name && result.move_id),
//             'The following entries are missing move info:' +
//                 results
//                     .filter((result) => !result.move_name || !result.move_id)
//                     .map((m) => m.full_move_name)
//                     .join(', '),
//         )

//         await fs.promises.writeFile(OUTPUT_JSON_PATH, JSON.stringify(results, null, 2))
//         console.log('CSV file successfully processed and saved as JSON.')
//     } catch (error) {
//         console.error('Error processing CSV file:', error)
//     }
// }

// parseCSVToJson()
