import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useApiClient } from "../services/apiClient";
import DOMPurify from "dompurify";
import { marked } from "marked";
import styles from "../styles/DocPage.module.scss";


const PublicDocumentPage: React.FC = () => {
    const { user } = useAuthContext();
    const { slug } = useParams<{ slug: string }>();
    const [content, setContent] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [displaySanitizedHtml, setDisplaySanitizedHtml] = useState<{__html:string} | null>(null);
    const api = useApiClient(user?.userId);

    useEffect(() => {
        const fetchDocument = async () => {
            if (slug) {
                try {
                    const data = await api.getPublicDocumentBySlug(slug);
                    setContent(data.content || ""); // デフォルト値を設定
                } catch (err) {
                    console.error(err);
                    setError("Failed to load the document.");
                }
            }
        };
        fetchDocument().then(
            async () => {
                // Markdown → HTML に変換
                const rawHtml: string = await marked(content || "");
                // サニタイズ処理
                const sanitizedHtml = DOMPurify.sanitize(rawHtml);
                setDisplaySanitizedHtml({ __html: sanitizedHtml });
            }
        ); // 非同期関数を呼び出し
    }, [slug, user, api, content]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!content) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.pdfContainerParent}>
            {/* PDF風スタイルを適用 */}
            <div className={styles.pdfContainer} dangerouslySetInnerHTML={displaySanitizedHtml!}/>
        </div>
    );
};

export default PublicDocumentPage;
