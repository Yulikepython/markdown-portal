import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuthContextSwitch as useAuthContext} from "../context/useAuthContextSwitch.ts";
import { useApiClient } from "../services/apiClient";
import styles from "../styles/DocPage.module.scss";

import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import ReactMarkdown from "react-markdown";

const PublicDocumentPage: React.FC = () => {
    const { user } = useAuthContext();
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
        fetchDocument().then();
    }, [slug, user, api, content]);

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
            {/* タイトルや説明 */}
            <p style={{fontSize: "1rem", marginBottom: "16px", color: "#555", textAlign:"right"}}>
                ※こちらのドキュメントは公開設定になっているため、URLを知っていれば誰でも閲覧可能です。
            </p>

            <div className={styles.pdfContainerParent}>
                <div className={styles.editor}>
                    <MdEditor
                        style={{}}
                        value={content}
                        onChange={({text}) => setContent(text)}
                        renderHTML={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
                        config={{
                            view: {menu: false, md: false, html: true},
                            canView: {fullScreen: true, hideMenu: true},
                        }}
                    />
                </div>
            </div>
            <div style={{margin: "16px 0"}}>
                <Link to="/" style={{color: "#007bff", textDecoration: "none"}}>
                    &larr; Home
                </Link>
            </div>
        </div>
    );
};

export default PublicDocumentPage;
