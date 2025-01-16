// App.tsx （抜粋）

import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import DocsListPage from "./pages/DocsListPage";
import DocPage from "./pages/DocPage";
import PublicDocumentPage from "./pages/PublicDocumentPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import { CombinedAuthProvider } from "./context/AuthContext.bridge";
import { useAuthContextSwitch as useAuthContext} from "./context/useAuthContextSwitch";
import "./App.css";
import footerStyles from "./styles/Footer.module.scss";
import TermsOfUsePage from "./pages/TermsOfUsePage";
import AccountInfoPage from "./pages/AccountInfoPage";

const App: React.FC = () => {
    return (
        <CombinedAuthProvider>
            <MainRouter />
        </CombinedAuthProvider>
    );
};

const MainRouter: React.FC = () => {
    const { isSignedIn, login, logout, displayName } = useAuthContext();

    return (
        <Router>
            {/* ナビゲーションバー */}
            <header className="navbar-custom">
                <div className="navbar-left">
                    <Link to="/" className="nav-logo">Markdown Portal</Link>
                </div>
                <div className="navbar-right">
                    {isSignedIn ? (
                        <>
                            <Link to="/account" className="user-email">
                                {displayName}
                            </Link>
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

            <main>
                <Routes>
                    {/* 新規作成 (DocPageを "新規モード" で表示) */}
                    <Route path="/" element={<DocPage />} />

                    {/* 自分のドキュメント一覧 */}
                    <Route path="/my-docs" element={<DocsListPage />} />

                    {/* 自分のドキュメント詳細・編集 */}
                    <Route path="/my-docs/:slug" element={<DocPage />} />

                    {/* 公開用ドキュメント */}
                    <Route path="/documents/:slug" element={<PublicDocumentPage />} />

                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms-of-use" element={<TermsOfUsePage />} />
                    <Route path="/account" element={<AccountInfoPage />} />
                </Routes>
            </main>

            <footer className={footerStyles.footerContainer}>
                <div className={footerStyles.footerContent}>
                    <p>© 2025 Markdown Portal</p>
                    <div>
                        <Link to="/privacy-policy" className={footerStyles.footerLink}>
                            プライバシーポリシー
                        </Link>
                        <span className={footerStyles.linkDivider}>|</span>
                        <Link to="/terms-of-use" className={footerStyles.footerLink}>
                            利用規約
                        </Link>
                    </div>
                </div>
            </footer>
        </Router>
    );
};

export default App;
