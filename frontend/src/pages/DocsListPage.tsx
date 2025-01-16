// DocsListPage.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApiClient } from "../services/apiClient";
import { useAuthContextSwitch as useAuthContext} from "../context/useAuthContextSwitch";
import { AxiosError } from "axios";

import styles from "../styles/DocsListPage.module.scss";

const extractTitle = (markdown: string): string => {
    const lines = markdown.split("\n");
    for (const line of lines) {
        if (/^#\s/.test(line)) {
            return line.replace(/^#\s*/, "").trim();
        }
    }
    return markdown.substring(0, 20).trim() || "Untitled";
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
        if (isSignedIn) {
            fetchDocs();
        }
    }, [api, user, isSignedIn]);

    if (error) {
        return <div style={{ color: "red" }}>{error}</div>;
    }

    // 「共有」ボタン押下時の挙動例
    const handleShare = (slug: string) => {
        const publicUrl = `${window.location.origin}/documents/${slug}`;
        navigator.clipboard.writeText(publicUrl);
        alert("公開URLをクリップボードにコピーしました!\n" + publicUrl);
    };

    return (
        <div style={{ width: "100%", maxWidth: "900px", margin: "10px auto", textAlign: "left" }}>
            {isSignedIn ? (
                <>
                    <div style={{ margin: "16px 0", textAlign: "right" }}>
                        {/* 新規ドキュメントは "/" に */}
                        <Link
                            to="/"
                            style={{
                                backgroundColor: "#007bff",
                                color: "white",
                                padding: "8px 12px",
                                borderRadius: "4px",
                                textDecoration: "none",
                            }}
                        >
                            + 新規ドキュメント
                        </Link>
                    </div>

                    <h1>ドキュメント一覧</h1>

                    <table className={styles.docsTable}>
                        <thead>
                        <tr style={{ backgroundColor: "#f0f0f0", borderBottom: "2px solid #ccc" }}>
                            <th style={{ padding: "8px", textAlign: "left" }}>タイトル</th>
                            <th style={{ padding: "8px", textAlign: "left", width: "150px" }}>
                                公開ステータス
                            </th>
                            <th style={{ padding: "8px", textAlign: "left", width: "120px" }}>
                                操作
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {documents.map((doc) => {
                            const title = extractTitle(doc.content);
                            const isPublic = doc.isPublic;
                            return (
                                <tr key={doc.slug} style={{ borderBottom: "1px solid #ddd" }}>
                                    {/* タイトル */}
                                    <td style={{ padding: "8px" }}>
                                        <Link
                                            to={`/my-docs/${doc.slug}`}
                                            style={{ color: "#007bff", textDecoration: "none" }}
                                        >
                                            <strong>{title}</strong>
                                        </Link>
                                    </td>

                                    {/* 公開/非公開 */}
                                    <td style={{ padding: "8px" }}>
                                        {isPublic ? (
                                            <span style={{ color: "green" }}>公開</span>
                                        ) : (
                                            <span style={{ color: "gray" }}>非公開</span>
                                        )}
                                    </td>

                                    {/* 共有ボタン（公開時のみ） */}
                                    <td style={{ padding: "8px" }}>
                                        {isPublic ? (
                                            <button className={styles.shareButton} onClick={() => handleShare(doc.slug)}>
                                                共有
                                            </button>
                                        ) : (
                                            <em style={{ fontSize: "0.9rem", color: "#888" }}>-</em>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </>
            ) : (
                <div>ログインしてください</div>
            )}
        </div>
    );
};

export default DocsListPage;
