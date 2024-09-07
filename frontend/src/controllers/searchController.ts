import { PokemonV1 } from '../data/pokemon-data.ts'

import POKEMON_DATA from '../data/pokemon-index.json'

export type FilterOptions = {
    enableFused: boolean
    enableUnfused: boolean
    enableLegendaries: boolean

    moves: string[]
    ability: string
    types: string[]

    minHp: number
    minAttack: number
    minDefense: number
    minSpecialAttack: number
    minSpecialDefense: number
    minSpeed: number
}

export type SortOptions = {
    sortBy?: 'dex_no' | 'name'
    sortOrder?: 'asc' | 'desc'
}

export const SORT_OPTION_DEX_NO = 'dex_no'
export const SORT_OPTION_NAME = 'name'
export const SORT_ORDER_ASC = 'asc'
export const SORT_ORDER_DESC = 'desc'

// NOTE: Eventually there should be separation between view controller and calculation controller

export function applyFilterAndSort(
    filterOptions: FilterOptions,
    sortOptions: SortOptions,
): PokemonV1[] {
    console.log('Hello, world!', filterOptions, sortOptions)

    let data = POKEMON_DATA

    // Apply stat filters
    data = data.filter((pokemon) => {
        if (pokemon.stats.hp < filterOptions.minHp) {
            return false
        }
        if (pokemon.stats.attack < filterOptions.minAttack) {
            return false
        }
        if (pokemon.stats.defense < filterOptions.minDefense) {
            return false
        }
        if (pokemon.stats.specialAttack < filterOptions.minSpecialAttack) {
            return false
        }
        if (pokemon.stats.specialDefense < filterOptions.minSpecialDefense) {
            return false
        }
        if (pokemon.stats.speed < filterOptions.minSpeed) {
            return false
        }
        return true
    })

    // Sort
    switch (sortOptions.sortBy) {
        case SORT_OPTION_DEX_NO:
            if (sortOptions.sortOrder === SORT_ORDER_ASC) {
                return data.sort((a, b) => a.ifDex - b.ifDex)
            }
            return data.sort((a, b) => b.ifDex - a.ifDex)
        case SORT_OPTION_NAME:
            if (sortOptions.sortOrder === SORT_ORDER_ASC) {
                return data.sort((a, b) => a.name.localeCompare(b.name))
            }
            return data.sort((a, b) => b.name.localeCompare(a.name))
        default:
            // We should never hit this case
            throw new Error('Invalid sort option' + sortOptions.sortBy)
    }
}
