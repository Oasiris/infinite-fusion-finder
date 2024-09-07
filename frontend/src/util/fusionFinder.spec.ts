import { exportForTesting, findFusionsV1 } from './fusionFinder'
import { PokemonV1 } from '../data/pokemon-data'

import * as POKEMON_DATA from '../data/pokemon-index.json'

const pokemonData: PokemonV1[] = []
const pokemonDataSample: PokemonV1[] = [] // Samples #1-25
let i = 0
while (POKEMON_DATA[i] !== undefined) {
    pokemonData.push(POKEMON_DATA[i] as PokemonV1)
    if (i < 25) {
        pokemonDataSample.push(POKEMON_DATA[i] as PokemonV1)
    }
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

// TODO: Run a fusion on every single combination and ensure there is no pokemon with:
// - two of the same type
// - three or more types

describe('fuseTypes', () => {
    const tests = [
        // Base case 1
        {
            inputHead: pokemonData.find((p) => p.name === 'persian'),
            inputBody: pokemonData.find((p) => p.name === 'persian'),
            expectedTypes: ['normal'],
        },
        {
            inputHead: pokemonData.find((p) => p.name === 'rattata'),
            inputBody: pokemonData.find((p) => p.name === 'persian'),
            expectedTypes: ['normal'],
        },
        // Base case 2
        {
            inputHead: pokemonData.find((p) => p.name === 'venusaur'),
            inputBody: pokemonData.find((p) => p.name === 'venusaur'),
            expectedTypes: ['grass', 'poison'],
        },
        {
            inputHead: pokemonData.find((p) => p.name === 'bellossom'),
            inputBody: pokemonData.find((p) => p.name === 'venusaur'),
            expectedTypes: ['grass', 'poison'],
        },
        // Test the monotype head clause
        {
            inputHead: pokemonData.find((p) => p.name === 'oddish'),
            inputBody: pokemonData.find((p) => p.name === 'grimer'),
            expectedTypes: ['grass', 'poison'],
        },
        {
            inputHead: pokemonData.find((p) => p.name === 'grimer'),
            inputBody: pokemonData.find((p) => p.name === 'oddish'),
            expectedTypes: ['poison', 'grass'],
        },
        // Types are inverse of each other
        {
            inputHead: pokemonData.find((p) => p.name === 'toxapex'),
            inputBody: pokemonData.find((p) => p.name === 'tentacruel'),
            expectedTypes: ['poison', 'water'],
        },
        {
            inputHead: pokemonData.find((p) => p.name === 'tentacruel'),
            inputBody: pokemonData.find((p) => p.name === 'toxapex'),
            expectedTypes: ['water', 'poison'],
        },
        // poison-flying (head) + poison (body) can yield a mono-type poison
        {
            inputHead: pokemonData.find((p) => p.name === 'crobat'),
            inputBody: pokemonData.find((p) => p.name === 'grimer'),
            expectedTypes: ['poison'],
        },
        {
            inputHead: pokemonData.find((p) => p.name === 'grimer'),
            inputBody: pokemonData.find((p) => p.name === 'crobat'),
            expectedTypes: ['poison', 'flying'],
        },
        // Test the dominant type clause for Normal/Flying
        {
            inputHead: pokemonData.find((p) => p.name === 'venusaur'),
            inputBody: pokemonData.find((p) => p.name === 'pidgeot'),
            expectedTypes: ['grass', 'flying'],
        },
        {
            inputHead: pokemonData.find((p) => p.name === 'pidgeot'),
            inputBody: pokemonData.find((p) => p.name === 'venusaur'),
            expectedTypes: ['flying', 'poison'],
        },
        // Dominant type clause for Normal/Flying where body is pure Normal
        {
            inputHead: pokemonData.find((p) => p.name === 'dodrio'),
            inputBody: pokemonData.find((p) => p.name === 'raticate'),
            expectedTypes: ['flying', 'normal'],
        },
        {
            inputHead: pokemonData.find((p) => p.name === 'raticate'),
            inputBody: pokemonData.find((p) => p.name === 'dodrio'),
            expectedTypes: ['normal', 'flying'],
        },
    ]
    for (const test of tests) {
        it(`${test.inputHead!.name} + ${test.inputBody!.name} => ${test.expectedTypes}`, () => {
            const fusedTypes = fuseTypes({
                head: test.inputHead!,
                body: test.inputBody!,
            })
            const expectedTypesProper = test.expectedTypes.map((type, i) => ({ type, slot: i + 1 }))
            expect(fusedTypes).toEqual(expectedTypesProper)
        })
    }
})

describe('fuse', () => {
    const head: PokemonV1 = testmons[1]
    const body: PokemonV1 = testmons[2]

    it('should fuse stats correctly', () => {
        const fusedStats = fuseStats({ head: head, body: body })
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
        const fusedMoves = fuseMoves({ head: head, body: body })
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
        const fusedAbilities = fuseAbilities({
            head: head,
            body: body,
        })
        expect(fusedAbilities).toEqual(
            expect.arrayContaining([
                { ability: 'overgrow', slot: 1, from: 'onemon' },
                { ability: 'blaze', slot: 1, from: 'twomon' },
            ]),
        )
    })

    it('should fuse types correctly', () => {
        const fusedTypes = fuseTypes({ head: head, body: body })
        expect(fusedTypes).toEqual(
            expect.arrayContaining([
                { type: 'grass', slot: 1 },
                { type: 'fire', slot: 2 },
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
                { ability: 'overgrow', slot: 1, from: 'onemon' },
                { ability: 'blaze', slot: 1, from: 'twomon' },
            ]),
            types: [
                { type: 'grass', slot: 1 },
                { type: 'fire', slot: 2 },
            ],
        })
    })
})

describe('findFusionsV1', () => {
    describe('Full data', () => {
        describe('name', () => {
            it('filter by name', () => {
                const fusions = findFusionsV1({ names: ['pikachu'] }, pokemonData)
                expect(fusions).toHaveLength((pokemonData.length - 1) * 2 + 1)
            })
            it('filter by ability', () => {
                const _fusions = findFusionsV1({ abilities: ['swift-swim'] }, pokemonData)
                expect(_fusions).toBeTruthy()
            })
            it('filter by move', () => {
                const _fusions = findFusionsV1({ moves: ['reflect'] }, pokemonData)
                expect(_fusions).toBeTruthy()
            })
            it('filter by hp', () => {
                const _fusions = findFusionsV1({ min: { hp: 10 } }, pokemonData)
                expect(_fusions).toBeTruthy()
            })
            it('filter by hp again', () => {
                const _fusions = findFusionsV1({ min: { hp: 120 } }, pokemonData)
                expect(_fusions).toBeTruthy()
            })
            it('filter by bst', () => {
                const _fusions = findFusionsV1({ min: { bst: 10 } }, pokemonData)
                expect(_fusions).toBeTruthy()
            })
            it('filter by type', () => {
                const _fusions = findFusionsV1({ type: 'water' }, pokemonData)
                expect(_fusions).toBeTruthy()
            })
            it('filter by multiple 1', () => {
                const _fusions = findFusionsV1(
                    {
                        moves: ['reflect'],
                        abilities: ['swift-swim'],
                        min: { bst: 10 },
                        type: 'water',
                    },
                    pokemonData,
                )
                expect(_fusions).toBeTruthy()
            })
            it('filter by multiple 2', () => {
                const _fusions = findFusionsV1(
                    {
                        moves: ['reflect'],
                        min: { bst: 10 },
                        type: 'water',
                    },
                    pokemonData,
                )
                expect(_fusions).toBeTruthy()
            })
            it('filter by multiple 3', () => {
                const _fusions = findFusionsV1(
                    {
                        min: { bst: 10 },
                        type: 'normal',
                    },
                    pokemonData,
                )
                expect(_fusions).toBeTruthy()
            })
        })
    })

    it('should find all fusions', () => {
        const fusions = findFusionsV1({}, pokemonDataSample)
        expect(fusions).toHaveLength(pokemonDataSample.length * pokemonDataSample.length)
    })
    describe('name', () => {
        it('should find 49 fusions (24 + 24 + 1)', () => {
            const fusions = findFusionsV1({ names: ['pikachu'] }, pokemonDataSample)
            expect(fusions).toHaveLength(49)
        })
    })
    describe('name', () => {
        it('should find 2 fusions', () => {
            const fusions = findFusionsV1({ names: ['bulbasaur', 'squirtle'] }, pokemonDataSample)
            expect(fusions).toHaveLength(2)
        })
    })
})
