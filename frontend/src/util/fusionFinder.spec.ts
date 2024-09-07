import { exportForTesting } from './fusionFinder'
import { PokemonV1 } from '../data/pokemon-data'

import * as POKEMON_DATA from '../data/pokemon-index.json'

const pokemonData: PokemonV1[] = []
let i = 0
while (POKEMON_DATA[i] !== undefined) {
    pokemonData.push(POKEMON_DATA[i] as PokemonV1)
    i++
}

const { fuseStats, fuseMoves, fuseAbilities, fuseTypes, fuse } = exportForTesting

const testmons: Record<string, PokemonV1> = {
    1: {
        version: 1,
        type: 'pokemon',
        ifDex: 1,
        nationalDex: 1,
        name: 'onemon',
        stats: {
            hp: 60,
            attack: 80,
            defense: 70,
            specialAttack: 90,
            specialDefense: 60,
            speed: 100,
        },
        moves: {
            levelup: [{ name: 'tackle', level: 1, learn_method: 'levelup' }],
            machine: [{ name: 'hyper-beam', learn_method: 'machine' }],
            tutor: [{ name: 'draco-meteor', learn_method: 'tutor' }],
            egg: [{ name: 'dragon-dance', learn_method: 'egg' }],
        },
        abilities: [{ ability: 'overgrow', slot: 1 }],
        types: [
            { type: 'grass', slot: 1 },
            { type: 'poison', slot: 2 },
        ],
    },
    2: {
        version: 1,
        type: 'pokemon',
        ifDex: 2,
        nationalDex: 2,
        name: 'twomon',
        stats: {
            hp: 80,
            attack: 70,
            defense: 90,
            specialAttack: 60,
            specialDefense: 80,
            speed: 50,
        },
        moves: {
            levelup: [{ name: 'scratch', level: 1, learn_method: 'levelup' }],
            machine: [{ name: 'earthquake', learn_method: 'machine' }],
            tutor: [{ name: 'fire-punch', learn_method: 'tutor' }],
            egg: [{ name: 'belly-drum', learn_method: 'egg' }],
        },
        abilities: [{ ability: 'blaze', slot: 1 }],
        types: [{ type: 'fire', slot: 1 }],
    },
}

describe('fuseTypes', () => {
    const tests = [
        {
            inputHead: pokemonData.find((p) => p.name === 'oddish'),
            inputBody: pokemonData.find((p) => p.name === 'grimer'),
            expectedTypes: ['grass', 'poison'],
        },
        {
            inputHead: pokemonData.find((p) => p.name === 'grimer'),
            inputBody: pokemonData.find((p) => p.name === 'oddish'),
            expectedTypes: ['grass', 'poison'],
        },
    ]
    for (const test of tests) {
        it(`${test.inputHead!.name} and ${test.inputBody!.name} => ${test.expectedTypes}`, () => {
            const fusedTypes = fuseTypes({ head: test.inputHead, body: test.inputBody })
            expect(fusedTypes.map((t) => t.type)).toEqual(test.expectedTypes)
        })
    }
})

describe('fuse', () => {
    const head: PokemonV1 = testmons[1]
    const body: PokemonV1 = testmons[2]

    it('should fuse stats correctly', () => {
        const fusedStats = fuseStats({ head, body })
        expect(fusedStats).toEqual({
            hp: expect.closeTo(66.67, 0.02),
            attack: expect.closeTo(73.33, 0.02),
            defense: expect.closeTo(83.33, 0.02),
            specialAttack: expect.closeTo(80, 0.02),
            specialDefense: expect.closeTo(66.67, 0.02),
            speed: expect.closeTo(66.67, 0.02),
        })
    })

    it('should fuse moves correctly', () => {
        const fusedMoves = fuseMoves({ head, body })
        expect(fusedMoves.levelup).toEqual(
            expect.arrayContaining([
                { name: 'tackle', level: 1, learn_method: 'levelup' },
                { name: 'scratch', level: 1, learn_method: 'levelup' },
            ]),
        )
        expect(fusedMoves.machine).toEqual(
            expect.arrayContaining([
                { name: 'hyper-beam', learn_method: 'machine' },
                { name: 'earthquake', learn_method: 'machine' },
            ]),
        )
        expect(fusedMoves.tutor).toEqual(
            expect.arrayContaining([
                { name: 'draco-meteor', learn_method: 'tutor' },
                { name: 'fire-punch', learn_method: 'tutor' },
            ]),
        )
        expect(fusedMoves.egg).toEqual(
            expect.arrayContaining([
                { name: 'dragon-dance', learn_method: 'egg' },
                { name: 'belly-drum', learn_method: 'egg' },
            ]),
        )
    })

    it('should fuse abilities correctly', () => {
        const fusedAbilities = fuseAbilities({ head, body })
        expect(fusedAbilities).toEqual(
            expect.arrayContaining([
                { ability: 'overgrow', slot: 1, from: 'onemon' },
                { ability: 'blaze', slot: 1, from: 'twomon' },
            ]),
        )
    })

    it('should fuse types correctly', () => {
        const fusedTypes = fuseTypes({ head, body })
        expect(fusedTypes).toEqual(
            expect.arrayContaining([
                { type: 'grass', slot: 1, from: 'onemon' },
                { type: 'fire', slot: 1, from: 'twomon' },
            ]),
        )
    })

    it('should fuse a Pokemon correctly', () => {
        const fusedPokemon = fuse({ head, body })
        expect(fusedPokemon).toEqual({
            version: 1,
            type: 'pokemon',
            ifDex: 0,
            nationalDex: 0,
            name: '',
            stats: {
                hp: expect.closeTo(66.67, 0.02),
                attack: expect.closeTo(73.33, 0.02),
                defense: expect.closeTo(83.33, 0.02),
                specialAttack: expect.closeTo(80, 0.02),
                specialDefense: expect.closeTo(66.67, 0.02),
                speed: expect.closeTo(66.67, 0.02),
            },
            moves: {
                levelup: expect.arrayContaining([
                    { name: 'tackle', level: 1, learn_method: 'levelup' },
                    { name: 'scratch', level: 1, learn_method: 'levelup' },
                ]),
                machine: expect.arrayContaining([
                    { name: 'hyper-beam', learn_method: 'machine' },
                    { name: 'earthquake', learn_method: 'machine' },
                ]),
                tutor: expect.arrayContaining([
                    { name: 'draco-meteor', learn_method: 'tutor' },
                    { name: 'fire-punch', learn_method: 'tutor' },
                ]),
                egg: expect.arrayContaining([
                    { name: 'dragon-dance', learn_method: 'egg' },
                    { name: 'belly-drum', learn_method: 'egg' },
                ]),
            },
            abilities: expect.arrayContaining([
                { type: 'grass', slot: 1, from: 'onemon' },
                { type: 'fire', slot: 1, from: 'twomon' },
            ]),
            types: [
                { type: 'grass', slot: 1, from: 'onemon' },
                { type: 'fire', slot: 1, from: 'twomon' },
            ],
        })
    })
})
