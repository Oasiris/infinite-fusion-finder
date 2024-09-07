import React from 'react'
import POKEMON_DATA from '../data/pokemon-index.json'
import {
    FilterOptions,
    getPokemonAndFusions,
    SORT_OPTION_DEX_NO,
    SORT_OPTION_NAME,
    SORT_ORDER_ASC,
    SORT_ORDER_DESC,
    SortOptions,
} from '../util/fusionFinder'

type PokemonData = typeof POKEMON_DATA

export default function SearchPage() {
    // The search page owns the state of filterOptions and sortOptions.

    // SearchControls is an interface for the user to interact with the filterOptions and sortOptions.

    // TableView displays the data in a table format, according to sortOptions and filterOptions.

    const [filterOptions, setFilterOptions] = React.useState({
        enableFused: false,
        enableUnfused: true,
        enableLegendaries: false,
    } as FilterOptions)
    const [sortOptions, setSortOptions] = React.useState({
        sortBy: 'dex_no',
        sortOrder: 'asc',
    } as SortOptions)
    const data = getPokemonAndFusions(filterOptions, sortOptions)

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
        </div>
    )
}

function Switch({
    children,
    toggled,
    onClick,
    ...props
}: {
    children: React.ReactNode
    toggled: boolean
    onClick?: React.MouseEventHandler<HTMLButtonElement>
    [key: string]: any
}) {
    return (
        <button onClick={onClick} {...props}>
            {children}
            <span>{toggled ? 'ON' : 'OFF'}</span>
        </button>
    )
}

function TableView({ data }: { data: PokemonData }) {
    return (
        <>
            <table>
                <tbody>
                    <tr>
                        <th>Dex No.</th>
                        <th>Name</th>
                        <th>Types</th>
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
