import {
    Route,
    Link,
    Outlet,
    createBrowserRouter,
    createRoutesFromElements,
    RouterProvider,
} from 'react-router-dom'

import Home from './routes/home.tsx'
import ErrorBoundary from './routes/error-boundary'

// Uncomment this when you're ready to replace "Not found" error boundary page with a dedicated "Not found" page.
// import NoMatch from './routes/no-match'

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Layout />} errorElement={<ErrorBoundary />}>
            <Route errorElement={<ErrorBoundary />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="dashboard" element={<Dashboard />} />

                {/* Using path="*"" means "match anything", so this route
                acts like a catch-all for URLs that we don't have explicit
                routes for. */}
                {/* <Route path="*" element={<NoMatch />} /> */}
            </Route>
        </Route>,
    ),
)

export default function App() {
    return (
        <div>
            <h3>
                Basic <code>react-router</code> Layout
            </h3>

            <p>
                This demonstrates some of the core features of React Router including nested{' '}
                <code>&lt;Route&gt;</code>s, <code>&lt;Outlet&gt;</code>s, <code>&lt;Link&gt;</code>
                s, and using a "*" route (aka "splat route") to render a "not found" page when
                someone visits an unrecognized URL.
            </p>

            {/* Routes nest inside one another. Nested route paths build upon
                parent route paths, and nested route elements render inside
                parent route elements. See the note about <Outlet> below. */}
            <RouterProvider router={router} />
        </div>
    )
}

function Layout() {
    return (
        <div>
            {/* A "layout route" is a good place to put markup you want to
            share across all the pages on your site, like navigation. */}
            <nav>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/about">About</Link>
                    </li>
                    <li>
                        <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li>
                        <Link to="/nothing-here">Nothing Here</Link>
                    </li>
                </ul>
            </nav>

            <hr />

            {/* An <Outlet> renders whatever child route is currently active,
            so you can think about this <Outlet> as a placeholder for
            the child routes we defined above. */}
            <Outlet />

            <hr />

            <footer>
                <br />
                This is a basic footer.
            </footer>
        </div>
    )
}

function About() {
    return (
        <div>
            <h1>About</h1>
            <p>This is the About section</p>
        </div>
    )
}

function Dashboard() {
    return (
        <div>
            <h1>Dashboard</h1>
            <p>This is the Dashboard</p>
        </div>
    )
}
