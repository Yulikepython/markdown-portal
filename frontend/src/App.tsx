import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import DocsListPage from "./pages/DocsListPage";
import DocPage from "./pages/DocPage";
import PublicDocumentPage from "./pages/PublicDocumentPage";

import { CombinedAuthProvider, useAuthContext } from "./context/AuthContext.bridge";

const App: React.FC = () => {
    return (
        <CombinedAuthProvider>
            <MainRouter />
        </CombinedAuthProvider>
    );
};

const MainRouter: React.FC = () => {
    const { isSignedIn, userEmail, login, logout } = useAuthContext();

    return (
        <Router>
            <div className="navbar">
                <Link to="/" className="logo">Markdown Portal</Link>
                {isSignedIn ? (
                    <div className="auth-info">
                        <span>{`Logged in as: ${userEmail || "unknown"}`}</span>
                        <button onClick={logout}>Logout</button>
                    </div>
                ) : (
                    <button onClick={login}>Login</button>
                )}
            </div>

            <Routes>
                <Route path="/" element={<DocsListPage />} />
                <Route path="/docs/:slug" element={<DocPage />} />
                <Route path="/docs/new" element={<DocPage />} />
                <Route path="/documents/:slug" element={<PublicDocumentPage />} />
            </Routes>
        </Router>
    );
};

export default App;
