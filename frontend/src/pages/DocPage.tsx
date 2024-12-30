import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApiClient } from "../services/apiClient";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import ReactMarkdown from "react-markdown";
import { useAuthContext } from "../context/AuthContext";

import styles from "../styles/DocPage.module.scss";


const DocPage: React.FC = () => {
    const { user, isSignedIn } = useAuthContext();
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const [content, setContent] = useState<string>("");
    const [isPublic, setIsPublic] = useState<boolean>(false);
    const [isEditable, setIsEditable] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const api = useApiClient(user?.userId);

    useEffect(() => {
        const fetchDocument = async () => {
            if (slug) {
                try {
                    const document = await api.getDocumentBySlug(slug);
                    setContent(document?.content);
                    setIsEditable(document?.userId === user?.userId && isSignedIn);
                    setIsPublic(document?.isPublic);
                } catch (err) {
                    console.error(err);
                    setError("Failed to load the document.");
                }
            }
        };
        fetchDocument().then();
    }, [slug, user, isSignedIn, api, document]);

    //チェックボックスを反映する
    const handleCheck = () => {
        setIsPublic(!isPublic);
    }

    const handleSave = async () => {
        try {
            if (slug) {
                await api.updateDocument(slug, content, isPublic);
            } else {
                await api.createDocument(content);
            }
            navigate("/");
        } catch (err) { //eslint-disable-line
            setError("Failed to save the document.");
        }
    };

    if (error) {
        return (
            <>
                <div className={styles.errorMessage}>{error}</div>
            </>
        );
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
                    <div className={styles.checkbox}>
                        <input type="checkbox" id="public" name="public" checked={isPublic} onChange={handleCheck}/>
                        <label htmlFor="public">公開する</label>
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
