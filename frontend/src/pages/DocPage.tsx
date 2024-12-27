import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDocumentById, createDocument, updateDocument } from "../services/apiClient";
import { marked } from "marked";
import DOMPurify from "dompurify";

const DocPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [content, setContent] = useState<string>(""); // Markdownコンテンツ
    const [isEditable, setIsEditable] = useState<boolean>(true); // 所有者かどうか
    const [previewHTML, setPreviewHTML] = useState<string>(""); // HTMLプレビュー
    const [error, setError] = useState<string | null>(null);

    // ドキュメントの読み込み
    useEffect(() => {
        const fetchDocument = async () => {
            if (id) {
                try {
                    const data = await getDocumentById(id);
                    setContent(data.content);
                    setIsEditable(data.isOwner); // 所有者情報を取得
                } catch (err) { //eslint-disable-line
                    setError("Failed to load the document.");
                }
            }
        };

        fetchDocument().then(); // 非同期関数を内部で呼び出す
    }, [id]);

    // MarkdownをHTMLにパース
    useEffect(() => {
        const convertToHTML = async () => {
            const rawHTML = await marked(content); // Markdown → HTML変換
            setPreviewHTML(DOMPurify.sanitize(rawHTML)); // HTMLをサニタイズ
        };

        convertToHTML().then(); // 非同期関数を内部で呼び出す
    }, [content]);

    const handleSave = async () => {
        try {
            if (id) {
                await updateDocument(id, "", content); // タイトルなし
            } else {
                await createDocument("", content); // タイトルなし
            }
            navigate("/"); // 保存後、一覧ページへリダイレクト
        } catch (err) { //eslint-disable-line
            setError("Failed to save the document.");
        }
    };

    if (error) {
        return <div style={{ color: "red" }}>{error}</div>;
    }

    return (
        <div style={{ display: "flex" }}>
            {/* 左ペイン: Markdown入力エリア */}
            <div style={{ flex: 1, marginRight: "16px" }}>
                {isEditable ? (
                    <>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your Markdown here..."
                style={{ width: "100%", height: "400px" }}
            />
                        <button onClick={handleSave} style={{ marginTop: "8px" }}>
                            Save
                        </button>
                    </>
                ) : (
                    <p>You do not have permission to edit this document.</p>
                )}
            </div>

            {/* 右ペイン: HTMLプレビュー */}
            <div style={{ flex: 1, borderLeft: "1px solid #ccc", paddingLeft: "16px" }}>
                <h1>Preview</h1>
                <div
                    dangerouslySetInnerHTML={{
                        __html: previewHTML, // MarkdownをHTMLに変換して表示
                    }}
                />
            </div>
        </div>
    );
};

export default DocPage;
