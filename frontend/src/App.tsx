import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import DocsListPage from "./pages/DocsListPage";
import DocPage from "./pages/DocPage";

import { Amplify } from "aws-amplify";
import { signInWithRedirect, signOut } from "aws-amplify/auth";
import { config } from "./config/amplifyConfigure.ts";
import { AuthProvider, useAuthContext } from "./context/AuthContext";

Amplify.configure(config);

const App: React.FC = () => {
    return (
        <AuthProvider>
            <MainRouter />
        </AuthProvider>
    );
};

const MainRouter: React.FC = () => {
    const { user, isSignedIn } = useAuthContext();

    return (
        <Router>
            <div className="navbar">
                <Link to="/" className="logo">
                    Doc Manager
                </Link>
                {isSignedIn ? (
                    <div className="auth-info">
                        <span>{`Logged in as: ${user?.email}`}</span>
                        <button onClick={() => signOut()}>Logout</button>
                    </div>
                ) : (
                    <button onClick={() => signInWithRedirect()}>Login</button>
                )}
            </div>
            <Routes>
                <Route path="/" element={<DocsListPage />} />
                <Route path="/docs/:id" element={<DocPage />} />
                <Route path="/docs/new" element={<DocPage />} />
            </Routes>
        </Router>
    );
};

export default App;
