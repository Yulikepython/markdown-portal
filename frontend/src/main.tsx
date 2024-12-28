import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from "react-oidc-context";

import './index.css'
import App from './App.tsx'

const cognitoAuthConfig = {
    authority: "https://ap-northeast-11c8s4palp.auth.ap-northeast-1.amazoncognito.com",
    client_id: "7dvpfam3cauc1li3ncdi8ch75c",
    // redirect_uri: "https://d84l1y8p4kdic.cloudfront.net",
    redirect_uri: "http://localhost:3000",
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
