// App.tsx (抜粋)
import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import DocsListPage from "./pages/DocsListPage";
import DocPage from "./pages/DocPage";
import PublicDocumentPage from "./pages/PublicDocumentPage";

import { CombinedAuthProvider } from "./context/AuthContext.bridge";
import { useAuthContextSwitch as useAuthContext} from "./context/useAuthContextSwitch.ts";
import "./App.css"; // 必要に応じて、追加CSSをApp.cssなどに追記

const App: React.FC = () => {
    return (
        <CombinedAuthProvider>
            <MainRouter />
        </CombinedAuthProvider>
    );
};

const MainRouter: React.FC = () => {
    const { isSignedIn, user, login, logout } = useAuthContext();

    //user.usernameの最初の5文字を取得する
    const accountDisplay = user ? user.userId.slice(0, 7) : null;

    return (
        <Router>
            {/* ナビゲーションバー */}
            <header className="navbar-custom">
                <div className="navbar-left">
                    <Link to="/" className="nav-logo">
                        Markdown Portal
                    </Link>
                </div>
                <div className="navbar-right">
                    {isSignedIn ? (
                        <>
                            {/* メールアドレスを右寄せ表示 */}
                            <span className="user-email">{ isSignedIn ? accountDisplay : ""}</span>
                            <button className="logout-btn" onClick={logout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <button className="login-btn" onClick={login}>
                            Login
                        </button>
                    )}
                </div>
            </header>

            {/* ルーティング */}
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
