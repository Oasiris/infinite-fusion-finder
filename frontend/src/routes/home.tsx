import { useState } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '../assets/vite.svg'
import crabLogo from '/crab-favicon.svg'
import './home.scss'

function Home() {
    const [count, setCount] = useState(0)

    return (
        <>
            <div>
                <a href="https://vitejs.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={crabLogo} className="logo crab" alt="Crab logo" />
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
                <p>
                    Edit <code>src/routes/Home.tsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">Click on the Vite and React logos to learn more</p>

            <button
                style={{ background: 'pink' }}
                onClick={() => {
                    throw new Error(
                        'this is a custom error thrown at ' + new Date().toLocaleString(),
                    )
                }}
            >
                Click me to throw an error
            </button>
        </>
    )
}

export default Home
