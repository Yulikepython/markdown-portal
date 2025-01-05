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
                await api.createDocument(content, isPublic);
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

    // onClick ハンドラ例
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

    return (
        <div className={styles.container}>
            <div className={styles.breadcrumb}>
                <span onClick={() => navigate("/")}>Home</span> / Document
            </div>
            {isEditable ? (
                <>
                    <div className={styles.editor}>
                        <MdEditor
                            style={{height: "70vh"}}
                            value={content}
                            onChange={({text}) => setContent(text)}
                            renderHTML={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
                            // 例: ツールバーの設定を追加
                            config={{
                                view: {
                                    // エディタ上部のメニューを表示
                                    menu: true,
                                    // Markdownソース表示エリアを表示
                                    md: true,
                                    // HTMLプレビュー表示エリアを表示 (false にすれば隠せる)
                                    html: true,
                                },
                                canView: {
                                    // 全画面表示ボタン
                                    fullScreen: true,
                                    // メニューを隠すボタン
                                    hideMenu: false,
                                },
                            }}
                        />
                    </div>
                    <div className={styles.checkbox}>
                        <label htmlFor="public" style={{display: "block", marginBottom: "4px"}}>
                            <input
                                type="checkbox"
                                id="public"
                                name="public"
                                checked={isPublic}
                                onChange={handleCheck}
                                style={{marginRight: "6px"}}
                            />
                            公開する
                        </label>

                        {/* 補足説明を追加 */}
                        <small style={{color: "#555"}}>
                            チェックを入れると、誰でも閲覧できる公開URLが発行されます。
                        </small>
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
                    {isEditable && slug && (
                        <button
                            style={{ backgroundColor: "red", color: "white", marginLeft: "8px" }}
                            onClick={handleDelete}
                        >
                            削除
                        </button>
                    )}
                    {isPublic && slug && ( // 公開設定が true かつ slug が存在する場合
                        <div style={{ margin: "16px 0" }}>
                            <span style={{ marginRight: "12px" }}>
                              公開URL: {`${window.location.origin}/documents/${slug}`}
                            </span>
                            <button
                                onClick={() => {
                                    // クリップボードにコピー
                                    navigator.clipboard.writeText(
                                        `${window.location.origin}/documents/${slug}`
                                    );
                                    alert("公開URLをコピーしました！");
                                }}
                            >
                                共有
                            </button>
                            {/* 公開URLを新しいタブで確認できるリンク */}
                            <a
                                href={`${window.location.origin}/documents/${slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ marginLeft: "12px" }}
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
