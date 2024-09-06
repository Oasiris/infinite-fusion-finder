import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom'

export default function ErrorBoundary() {
    const error = useRouteError()
    console.error(error)

    const navigate = useNavigate()

    return (
        <div id="error-page">
            <h1>Oops!</h1>
            <p>Sorry, an unexpected error has occurred:</p>
            <h4 style={{ color: 'maroon' }}>
                <i>
                    {isRouteErrorResponse(error)
                        ? error.statusText || (error as any).message
                        : 'Unknown error message'}
                </i>
            </h4>

            <hr />

            <h4>More details</h4>
            <p>
                <code>{JSON.stringify(error, Object.getOwnPropertyNames(error))}</code>
            </p>

            <hr />

            <button type="button" onClick={() => navigate(-1)}>
                Go Back
            </button>
        </div>
    )
}
