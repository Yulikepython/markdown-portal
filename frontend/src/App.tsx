import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import DocsListPage from "./pages/DocsListPage";
import DocPage from "./pages/DocPage"; // 詳細/編集

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<DocsListPage />} />
                <Route path="/docs/:id" element={<DocPage />} /> {/* 詳細/編集 */}
                <Route path="/docs/new" element={<DocPage />} /> {/* 新規作成 */}
            </Routes>
        </Router>
    );
};

export default App;
