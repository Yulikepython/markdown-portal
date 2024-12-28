import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import DocsListPage from "./pages/DocsListPage";
import DocPage from "./pages/DocPage"; // 詳細/編集
import { useAuth } from "react-oidc-context";

const App: React.FC = () => {

    const auth = useAuth();
    const signOutRedirect = () => {
        const clientId = "7dvpfam3cauc1li3ncdi8ch75c";
        const logoutUri = "http://localhost:3000";
        const cognitoDomain = "https://ap-northeast-11c8s4palp.auth.ap-northeast-1.amazoncognito.com";
        window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    };

    if (auth.isLoading) {
        return <div>Loading...</div>;
    }

    if (auth.error) {
        return <div>Encountering error... {auth.error.message}</div>;
    }
    return (
        <>
            <div>
                <button onClick={() => auth.signinRedirect()}>Sign in</button>
                <button onClick={() => signOutRedirect()}>Sign out</button>
            </div>
            <Router>
                <Routes>
                    <Route path="/" element={<DocsListPage/>}/>
                    <Route path="/docs/:id" element={<DocPage/>}/> {/* 詳細/編集 */}
                    <Route path="/docs/new" element={<DocPage/>}/> {/* 新規作成 */}
                </Routes>
            </Router>
        </>

    );
};

export default App;
