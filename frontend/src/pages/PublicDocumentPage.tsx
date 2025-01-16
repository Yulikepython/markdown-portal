// PublicDocumentPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useApiClient } from "../services/apiClient";
import styles from "../styles/DocPage.module.scss";

import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import ReactMarkdown from "react-markdown";
// ★ 追加
import DOMPurify from "dompurify";

const PublicDocumentPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [content, setContent] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const api = useApiClient();

    useEffect(() => {
        const fetchDocument = async () => {
            if (slug) {
                try {
                    const data = await api.getPublicDocumentBySlug(slug);
                    setContent(data.content || "");
                } catch (err) {
                    console.error(err);
                    setError("Failed to load the document.");
                }
            }
        };
        fetchDocument();
    }, [slug, api]);

    if (error) {
        return (
            <div style={{ textAlign: "center", marginTop: "50px", color: "red" }}>
                Error: {error}
            </div>
        );
    }

    if (!content) {
        return (
            <div style={{ textAlign: "center", marginTop: "50px" }}>
                Loading...
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <p style={{ fontSize: "1rem", marginBottom: "16px", color: "#555", textAlign: "right" }}>
                ※こちらのドキュメントは公開設定になっているため、URLを知っていれば誰でも閲覧可能です。
            </p>

            <div className={styles.pdfContainerParent}>
                <div className={styles.editor}>
                    <MdEditor
                        style={{}}
                        value={content}
                        // ★ sanitize (最低限)
                        renderHTML={(text) => (
                            <ReactMarkdown>{DOMPurify.sanitize(text)}</ReactMarkdown>
                        )}
                        config={{
                            view: { menu: false, md: false, html: true },
                            canView: { fullScreen: true, hideMenu: true },
                        }}
                    />
                </div>
            </div>

            <div style={{ margin: "16px 0" }}>
                <Link to="/my-docs" style={{ color: "#007bff", textDecoration: "none" }}>
                    &larr; My Docs
                </Link>
            </div>
        </div>
    );
};

export default PublicDocumentPage;
