/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SERVER_API_URL: string
    readonly VITE_SERVER_STATIC_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
