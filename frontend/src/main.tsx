import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from "react-oidc-context";

import './index.css'
import App from './App.tsx'

const cognitoAuthConfig = {
    authority: `https://${import.meta.env.VITE_COGNITO_DOMAIN}.auth.ap-northeast-1.amazoncognito.com`,
    client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
    response_type: "code",
    scope: "email openid phone",
};

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider {...cognitoAuthConfig}>
            <App />
        </AuthProvider>
    </StrictMode>
)
