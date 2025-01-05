// DocPage.tsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApiClient } from "../services/apiClient";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import ReactMarkdown from "react-markdown";
import { useAuthContext } from "../context/AuthContext.bridge";
import styles from "../styles/DocPage.module.scss";

const DocPage: React.FC = () => {
    const { user, isSignedIn } = useAuthContext();
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const [content, setContent] = useState<string>("");
    const [isPublic, setIsPublic] = useState<boolean>(false);
    const [isEditable, setIsEditable] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const api = useApiClient();

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
    }, [slug, user, isSignedIn, api]);

    // チェックボックス反映
    const handleCheck = () => {
        setIsPublic(!isPublic);
    };

    const handleSave = async () => {
        try {
            if (slug) {
                await api.updateDocument(slug, content, isPublic);
            } else {
                // createDocument も isPublic を引数に渡すなら修正要
                await api.createDocument(content, isPublic);
            }
            navigate("/");
        } catch (err) { //eslint-disable-line
            setError("Failed to save the document.");
        }
    };

    // 削除
    const handleDelete = async () => {
        if (!slug) return;
        if (!window.confirm("本当に削除しますか？")) return;
        try {
            await api.deleteDocument(slug);
            navigate("/");
        } catch (err) {
            console.error(err);
            setError("削除に失敗しました");
        }
    };

    if (error) {
        return <div className={styles.errorMessage}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            {/* パンくず */}
            <div className={styles.breadcrumb}>
                <span onClick={() => navigate("/")}>Home</span> / Document
            </div>

            {isEditable ? (
                <>
                    <div className={styles.editor}>
                        <MdEditor
                            style={{ height: "70vh" }}
                            value={content}
                            onChange={({ text }) => setContent(text)}
                            renderHTML={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
                            config={{
                                view: { menu: true, md: true, html: true },
                                canView: { fullScreen: true, hideMenu: false },
                            }}
                        />
                    </div>

                    {/* 公開チェックボックス */}
                    <div className={styles.publicBlock}>
                        <label htmlFor="public">
                            <input
                                type="checkbox"
                                id="public"
                                name="public"
                                checked={isPublic}
                                onChange={handleCheck}
                            />
                            公開する
                        </label>
                        <small>チェックを入れると、誰でも閲覧できる公開URLが発行されます。</small>
                    </div>

                    {/* ボタン行 */}
                    <div className={styles.actionsRow}>
                        <button className={styles.saveButton} onClick={handleSave}>
                            Save
                        </button>
                        <button className={styles.topButton} onClick={() => navigate("/")}>
                            Back to Top
                        </button>

                        {/* 削除ボタン (あまり目立たせない) */}
                        {isEditable && slug && (
                            <button className={styles.deleteButton} onClick={handleDelete}>
                                削除
                            </button>
                        )}
                    </div>

                    {/* 公開URL/共有ブロック */}
                    {isPublic && slug && (
                        <div className={styles.publicUrlBox}>
                            <span className="publicUrlHeading">公開URL:</span>
                            <span>{`${window.location.origin}/documents/${slug}`}</span>

                            <button
                                className="shareButton"
                                onClick={() => {
                                    const url = `${window.location.origin}/documents/${slug}`;
                                    navigator.clipboard.writeText(url).then();
                                    alert("公開URLをコピーしました！\n" + url);
                                }}
                            >
                                共有
                            </button>
                            <a
                                href={`${window.location.origin}/documents/${slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                公開ページを開く
                            </a>
                        </div>
                    )}
                </>
            ) : (
                <p>編集権限はありません。</p>
            )}
        </div>
    );
};

export default DocPage;
