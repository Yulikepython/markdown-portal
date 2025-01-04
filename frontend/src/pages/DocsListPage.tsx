import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {useApiClient} from "../services/apiClient";
import { useAuthContext } from "../context/AuthContext.bridge";
import {AxiosError} from "axios";

const extractTitle = (markdown: string): string => {
    const lines = markdown.split("\n");
    for (const line of lines) {
        if (/^#\s/.test(line)) { // H1（# のみ）の行をチェック
            return line.replace(/^#\s*/, "").trim(); // H1部分を取り出す
        }
    }
    return markdown.substring(0, 20).trim() || "Untitled"; // デフォルトタイトル
};

const DocsListPage: React.FC = () => {
    const [documents, setDocuments] = useState<any[]>([]); //eslint-disable-line
    const [error, setError] = useState<string | null>(null);
    const { user, isSignedIn } = useAuthContext();
    const api = useApiClient();

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const data = await api.getDocuments();
                setDocuments(data);
            } catch (error) {
                if (error instanceof AxiosError) {
                    switch (error.response?.status) {
                        case 403:
                            setError("権限がありません。");
                            break;
                        case 404:
                            setError("ドキュメントが見つかりません。");
                            break;
                        case 500:
                            setError("Server error occurred");
                            break;
                        default:
                            setError(`Failed to fetch documents: ${error.message}`);
                    }
                } else {
                    setError("An unexpected error occurred");
                }
            }
        };
        fetchDocs().then();
    }, [api, user]);

    if (error) {
        return <div style={{ color: "red" }}>{error}</div>;
    }

    return (
        <div>
            {isSignedIn ? (
                <>
                    <h1>あなたのドキュメント一覧</h1>
                    <ul>
                        {documents.map((doc) => (
                            <li key={doc.slug}>
                                <Link to={`/docs/${doc.slug}`}>
                                    <strong>{extractTitle(doc.content)}</strong>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </>
            ) : <div>ログインしてください</div>
            }
        </div>
    );
};

export default DocsListPage;
