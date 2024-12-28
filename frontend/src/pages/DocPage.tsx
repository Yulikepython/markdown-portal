import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDocumentById, createDocument, updateDocument } from "../services/apiClient";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import ReactMarkdown from "react-markdown";
import { useAuthContext } from "../context/AuthContext";

import styles from "../styles/DocPage.module.scss";

const extractTitle = (markdown: string): string => {
    const lines = markdown.split("\n");
    for (const line of lines) {
        if (line.startsWith("#")) {
            return line.replace(/^#+\s*/, "").trim();
        }
    }
    return markdown.substring(0, 20).trim() || "Untitled";
};

const DocPage: React.FC = () => {
    const { user, isSignedIn } = useAuthContext();
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
                await updateDocument(id, title, content);
            } else {
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
            <div className={styles.breadcrumb}>
                <span onClick={() => navigate("/")}>Home</span> / Document
            </div>
            {isEditable ? (
                <>
                    <div className={styles.editor}>
                        <MdEditor
                            style={{ height: "80vh" }}
                            value={content}
                            onChange={({ text }) => setContent(text)}
                            renderHTML={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
                        />
                    </div>
                    <div className={styles.buttonGroup}>
                        <button className={styles.saveButton} onClick={handleSave}>
                            Save
                        </button>
                        <button
                            className={styles.topButton}
                            onClick={() => navigate("/")}
                        >
                            Back to Top
                        </button>
                    </div>
                </>
            ) : (
                <p>You do not have permission to edit this document.</p>
            )}
        </div>
    );
};

export default DocPage;
