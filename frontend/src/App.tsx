import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import DocsListPage from "./pages/DocsListPage";
import DocPage from "./pages/DocPage"; // 詳細/編集

import { Amplify } from "aws-amplify";
import { signInWithRedirect, signOut } from "aws-amplify/auth";
import { config } from "./config/amplifyConfigure.ts";
import { AuthProvider, useAuthContext } from './context/AuthContext';

Amplify.configure(config);

const App: React.FC = () => {
    // Providerで囲み、全ての子供コンポーネントがContextを参照できるように
    return (
        <AuthProvider>
            <MainRouter />
        </AuthProvider>
    );
};

const MainRouter: React.FC = () => {
    // useAuthContext でグローバルに保管してある user, isSignedIn を取得
    const { isSignedIn } = useAuthContext();

    return (
        <>
            <button onClick={() => signInWithRedirect()} disabled={isSignedIn}>
                ログイン
            </button>
            <button onClick={() => signOut()} disabled={!isSignedIn}>
                ログアウト
            </button>
            <Router>
                <Routes>
                    <Route path="/" element={<DocsListPage />} />
                    <Route path="/docs/:id" element={<DocPage />} />
                    <Route path="/docs/new" element={<DocPage />} />
                </Routes>
            </Router>
        </>
    );
};

export default App;
