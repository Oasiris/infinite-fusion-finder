export function Switch({
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

export function Range({
    children,
    value,
    min = 0,
    max = 255,
    onChange,
    ...props
}: {
    children: React.ReactNode
    value: number
    min?: number
    max?: number
    showValue?: boolean
    onChange?: React.ChangeEventHandler<HTMLInputElement>
    [key: string]: any
}) {
    return (
        <div>
            <label>
                {children}
                <input
                    type="number"
                    value={value}
                    min={min}
                    max={max}
                    onChange={onChange}
                    {...props}
                />
                <input
                    type="range"
                    value={value}
                    min={min}
                    max={max}
                    onChange={onChange}
                    {...props}
                />
            </label>
        </div>
    )
}
