import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDocumentById, createDocument, updateDocument } from "../services/apiClient";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import ReactMarkdown from "react-markdown";
import styles from "../styles/DocPage.module.scss";
import { useAuthContext } from "../context/AuthContext";

const extractTitle = (markdown: string): string => {
    const lines = markdown.split('\n');
    for (const line of lines) {
        if (line.startsWith('#')) {
            return line.replace(/^#+\s*/, '').trim();
        }
    }
    return markdown.substring(0, 20).trim() || "Untitled";
};

const DocPage: React.FC = () => {
    const { user, isSignedIn } = useAuthContext();  // ここで取得
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [content, setContent] = useState<string>("");
    const [isEditable, setIsEditable] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDocument = async () => {
            if (id) {
                try {
                    const data = await getDocumentById(id);
                    setContent(data.content);

                    // user?.attributes?.sub と userId が一致するか
                    setIsEditable(data.userId === user?.userId && isSignedIn);
                } catch (err) {
                    console.error(err);
                    setError("Failed to load the document.");
                }
            }
        };
        fetchDocument();
    }, [id, user, isSignedIn]);

    const handleSave = async () => {
        try {
            const title = extractTitle(content);
            if (id) {
                // 既存更新
                await updateDocument(id, title, content);
            } else {
                // 新規作成
                await createDocument(title, content);
            }
            navigate("/");
        } catch (err) {
            console.error("Error during save:", err);
            setError("Failed to save the document.");
        }
    };

    if (error) {
        return <div className={styles.errorMessage}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            {isEditable ? (
                <>
                    <div className={styles.editor}>
                        <MdEditor
                            style={{ flex: 1 }}
                            value={content}
                            onChange={({ text }) => setContent(text)}
                            renderHTML={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
                        />
                    </div>
                    <button className={styles.saveButton} onClick={handleSave}>
                        Save
                    </button>
                </>
            ) : (
                <p>You do not have permission to edit this document.</p>
            )}
        </div>
    );
};

export default DocPage;
