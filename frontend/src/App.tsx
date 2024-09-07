import {
    Route,
    Outlet,
    createBrowserRouter,
    createRoutesFromElements,
    RouterProvider,
} from 'react-router-dom'

import SearchPage from './routes/search.tsx'
import ErrorBoundary from './routes/error-boundary'

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Layout />} errorElement={<ErrorBoundary />}>
            <Route index element={<SearchPage />} />
            <Route path="*" element={<SearchPage />} />

            {/* Using path="*"" means "match anything", so this route
                acts like a catch-all for URLs that we don't have explicit
                routes for. */}
            {/* <Route path="*" element={<NoMatch />} /> */}
        </Route>,
    ),
)

export default function App() {
    return (
        <div>
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
            {/* An <Outlet> renders whatever child route is currently active,
            so you can think about this <Outlet> as a placeholder for
            the child routes we defined above. */}
            <Outlet />
        </div>
    )
}
