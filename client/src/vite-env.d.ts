/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOCKET_URL: string;
  // Füge hier weitere Umgebungsvariablen hinzu
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
