// DocPage.tsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApiClient } from "../services/apiClient";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import ReactMarkdown from "react-markdown";
import { useAuthContextSwitch as useAuthContext} from "../context/useAuthContextSwitch";
import styles from "../styles/DocPage.module.scss";
// ★ dompurify (任意：最低限のXSS対策例)
import DOMPurify from "dompurify";

const DocPage: React.FC = () => {
    const { user, isSignedIn } = useAuthContext();
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const [content, setContent] = useState<string>("");
    const [isPublic, setIsPublic] = useState<boolean>(false);
    const [isEditable, setIsEditable] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const api = useApiClient();

    // ------------------------
    // 初期読み込み
    // ------------------------
    useEffect(() => {
        const fetchDocument = async () => {
            // slug がある場合は既存のドキュメントを取得
            if (slug) {
                try {
                    const document = await api.getDocumentBySlug(slug);
                    setContent(document?.content);
                    // 所有者かどうか
                    setIsEditable(document?.userId === user?.userId && isSignedIn);
                    setIsPublic(document?.isPublic);
                } catch (err) {
                    console.error(err);
                    setError("Failed to load the document.");
                }
            } else {
                // slug が無い ⇒ 新規作成モード
                setContent(""); // 初期化（空）
                setIsEditable(isSignedIn); // ログインしていれば保存可能にする
            }
        };
        fetchDocument().then();
    }, [slug, user, isSignedIn, api]);

    // ------------------------
    // 公開チェック変更
    // ------------------------
    const handleCheck = () => {
        setIsPublic(!isPublic);
    };

    // ------------------------
    // 保存ボタン
    // ------------------------
    const handleSave = async () => {
        if (!isSignedIn) {
            alert("ログインしてください");
            return;
        }
        try {
            if (slug && isEditable) {
                // 既存 => update
                await api.updateDocument(slug, content, isPublic);
            } else {
                // 新規 => create
                await api.createDocument(content, isPublic);
            }
            navigate("/my-docs");  // 保存後は一覧へ飛ばす
        } catch (err) {
            console.error(err);
            setError("Failed to save the document.");
        }
    };

    // ------------------------
    // 削除
    // ------------------------
    const handleDelete = async () => {
        if (!slug || !isEditable) return;
        if (!window.confirm("本当に削除しますか？削除は取り消せません。")) return;

        try {
            await api.deleteDocument(slug);
            // 削除後は一覧へ
            navigate("/my-docs");
        } catch (err) {
            console.error(err);
            setError("削除に失敗しました");
        }
    };

    if (error) {
        return <div className={styles.errorMessage}>{error}</div>;
    }

    // ------------------------
    // レンダリング
    // ------------------------
    return (
        <div className={styles.container}>
            {/* パンくず */}
            <div className={styles.breadcrumb}>
                {slug ? (
                    <>
                        <span onClick={() => navigate("/my-docs")} style={{cursor:"pointer"}}>My Docs</span>
                        <span> / {slug}</span>
                    </>
                ) : (
                    <>
                        <span>New Document</span>
                    </>
                )}
            </div>

            <div className={styles.editor}>
                <MdEditor
                    style={{ height: "70vh" }}
                    value={content}
                    onChange={({ text }) => setContent(text)}
                    // ★ DOMPurifyをかませる例 (最低限)
                    renderHTML={(text) => (
                        <ReactMarkdown>{DOMPurify.sanitize(text)}</ReactMarkdown>
                    )}
                    config={{
                        view: { menu: true, md: true, html: true },
                        canView: { fullScreen: true, hideMenu: false },
                    }}
                />
            </div>

            {/* ボタン類 */}
            {(isEditable || isSignedIn) ? (
                <>
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

                    <div className={styles.actionsRow}>
                        <button className={styles.saveButton} onClick={handleSave}>
                            Save
                        </button>
                        {/* 新規 or 既存 どちらも一覧に戻る */}
                        <button className={styles.topButton} onClick={() => navigate("/my-docs")}>
                            Go to My Docs
                        </button>

                        {/* 既存ドキュメントのみ削除ボタン */}
                        {isEditable && slug && (
                            <button className={styles.deleteButton} onClick={handleDelete}>
                                削除
                            </button>
                        )}
                    </div>

                    {/* 公開URL(既存ドキュメント+公開の場合に表示) */}
                    {isPublic && slug && (
                        <div className={styles.publicUrlBox}>
                            <span className="publicUrlHeading">公開URL:</span>
                            <span>{`${window.location.origin}/documents/${slug}`}</span>
                            <button
                                className="shareButton"
                                onClick={() => {
                                    const url = `${window.location.origin}/documents/${slug}`;
                                    navigator.clipboard.writeText(url);
                                    alert("公開URLをコピーしました！\n" + url);
                                }}
                            >
                                共有
                            </button>
                            <a
                                href={`${window.location.origin}/documents/${slug}`}
                                target="_blank"
                                rel="noopener noreferrer" // ← セキュリティ面で追加
                            >
                                公開ページを開く
                            </a>
                        </div>
                    )}
                </>
            ) : (
                <p>ドキュメントの保存はログインユーザーのみ可能です。</p>
            )}
        </div>
    );
};

export default DocPage;
