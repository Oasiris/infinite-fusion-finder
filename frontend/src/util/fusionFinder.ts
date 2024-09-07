import { PokemonV1 } from '../data/pokemon-data.ts'

import POKEMON_DATA from '../data/pokemon-index.json'
import { noop } from './common.ts'

export type FilterOptions = {
    enableFused: boolean
    enableUnfused: boolean
    enableLegendaries: boolean
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

export function getPokemonAndFusions(
    filterOptions: FilterOptions,
    sortOptions: SortOptions,
): PokemonV1[] {
    console.log('Hello, world!', filterOptions, sortOptions)

    const data = POKEMON_DATA

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
