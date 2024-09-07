import React from 'react'
import POKEMON_DATA from '../data/pokemon-index.json'
import { FilterOptions, SortOptions, applyFilterAndSort } from '../controllers/searchController'
import { Switch, Range } from '../components'

type PokemonData = typeof POKEMON_DATA

const DEFAULT_FILTER_OPTIONS: FilterOptions = {
    enableFused: false,
    enableUnfused: true,
    enableLegendaries: false,
    minHp: 0,
    minAttack: 0,
    minDefense: 0,
    minSpecialAttack: 0,
    minSpecialDefense: 0,
    minSpeed: 0,
    moves: [],
    ability: '',
    types: [],
}
const DEFAULT_SORT_OPTIONS: SortOptions = {
    sortBy: 'dex_no',
    sortOrder: 'asc',
}

export default function SearchPage() {
    // The search page owns the state of filterOptions and sortOptions.

    // SearchControls is an interface for the user to interact with the filterOptions and sortOptions.

    // TableView displays the data in a table format, according to sortOptions and filterOptions.

    const [filterOptions, setFilterOptions] = React.useState(DEFAULT_FILTER_OPTIONS)
    const [sortOptions, setSortOptions] = React.useState(DEFAULT_SORT_OPTIONS)
    const data = applyFilterAndSort(filterOptions, sortOptions)

    return (
        <>
            <div>Hello World</div>
            <SearchControls
                filterOptions={filterOptions}
                sortOptions={sortOptions}
                setFilterOptions={setFilterOptions}
                setSortOptions={setSortOptions}
            />
            <TableView data={data as PokemonData} />
        </>
    )
}

function SearchControls({
    filterOptions,
    sortOptions,
    setFilterOptions,
    setSortOptions,
}: {
    filterOptions: FilterOptions
    sortOptions: SortOptions
    setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>
    setSortOptions: React.Dispatch<React.SetStateAction<SortOptions>>
}) {
    const handleToggleFused = () => {
        setFilterOptions({ ...filterOptions, enableFused: !filterOptions.enableFused })
    }
    const handleToggleUnfused = () => {
        setFilterOptions({ ...filterOptions, enableUnfused: !filterOptions.enableUnfused })
    }
    const handleToggleLegendaries = () => {
        setFilterOptions({ ...filterOptions, enableLegendaries: !filterOptions.enableLegendaries })
    }
    const handleSortByDexNo = () => {
        setSortOptions({ ...sortOptions, sortBy: 'dex_no' })
    }
    const handleSortByName = () => {
        setSortOptions({ ...sortOptions, sortBy: 'name' })
    }
    const handleSortOrderAsc = () => {
        setSortOptions({ ...sortOptions, sortOrder: 'asc' })
    }
    const handleSortOrderDesc = () => {
        setSortOptions({ ...sortOptions, sortOrder: 'desc' })
    }
    const handleMinHpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilterOptions({ ...filterOptions, minHp: parseInt(event.target.value) })
    }

    return (
        <div>
            <br />
            <Switch
                toggled={filterOptions.enableFused}
                onClick={handleToggleFused}
                style={{ background: filterOptions.enableFused ? 'limegreen' : 'yellow' }}
            >
                Show Fused
            </Switch>
            <Switch
                toggled={filterOptions.enableUnfused}
                onClick={handleToggleUnfused}
                style={{ background: filterOptions.enableUnfused ? 'limegreen' : 'yellow' }}
            >
                Show Unfused
            </Switch>
            <Switch
                toggled={filterOptions.enableLegendaries}
                onClick={handleToggleLegendaries}
                style={{ background: filterOptions.enableLegendaries ? 'limegreen' : 'yellow' }}
            >
                Show Legendaries
            </Switch>
            <Switch
                toggled={sortOptions.sortBy === 'dex_no'}
                onClick={handleSortByDexNo}
                style={{ background: sortOptions.sortBy === 'dex_no' ? 'limegreen' : 'yellow' }}
            >
                Sort by Dex Number
            </Switch>
            <Switch
                toggled={sortOptions.sortBy === 'name'}
                onClick={handleSortByName}
                style={{ background: sortOptions.sortBy === 'name' ? 'limegreen' : 'yellow' }}
            >
                Sort by Name
            </Switch>
            <Switch
                toggled={sortOptions.sortOrder === 'asc'}
                onClick={handleSortOrderAsc}
                style={{ background: sortOptions.sortOrder === 'asc' ? 'limegreen' : 'yellow' }}
            >
                Sort in Ascending Order
            </Switch>
            <Switch
                toggled={sortOptions.sortOrder === 'desc'}
                onClick={handleSortOrderDesc}
                style={{ background: sortOptions.sortOrder === 'desc' ? 'limegreen' : 'yellow' }}
            >
                Sort in Descending Order
            </Switch>
            <br />
            <Range value={filterOptions.minHp} onChange={handleMinHpChange}>
                Min HP
            </Range>
        </div>
    )
}

function TableView({ data }: { data: PokemonData }) {
    return (
        <>
            <div>
                Results: <span>{data.length}</span>
            </div>
            <table>
                <tbody>
                    <tr>
                        <th>Dex No.</th>
                        <th>Name</th>
                        <th>Types</th>
                        <th>HP</th>
                        <th>Atk</th>
                        <th>Def</th>
                        <th>Sp.Atk</th>
                        <th>Sp.Def</th>
                        <th>Spd</th>
                        <th>BST</th>
                    </tr>
                    {data.map((pokemon) => (
                        <tr key={pokemon.name}>
                            <td>{pokemon.ifDex}</td>
                            <td>{pokemon.name}</td>
                            <td>
                                <div style={{ display: 'flex' }}>
                                    {pokemon.types.map((type) => (
                                        <Type key={type.slot} type={type.type} />
                                    ))}
                                </div>
                            </td>
                            <td>{pokemon.stats.hp}</td>
                            <td>{pokemon.stats.attack}</td>
                            <td>{pokemon.stats.defense}</td>
                            <td>{pokemon.stats.specialAttack}</td>
                            <td>{pokemon.stats.specialDefense}</td>
                            <td>{pokemon.stats.speed}</td>
                            <td>
                                {pokemon.stats.hp +
                                    pokemon.stats.attack +
                                    pokemon.stats.defense +
                                    pokemon.stats.specialAttack +
                                    pokemon.stats.specialDefense +
                                    pokemon.stats.speed}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}

function Type({ type }: { type: string }) {
    return <span>{type}</span>
}
