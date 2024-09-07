import readline from 'node:readline'

/**
 * @example awaitPrompt('What is your name?') => Promise<"my user input here">
 */
export function awaitPrompt(query: string): Promise<string> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    return new Promise((resolve) =>
        rl.question(query, (answer) => {
            rl.close()
            resolve(answer)
        }),
    )
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
