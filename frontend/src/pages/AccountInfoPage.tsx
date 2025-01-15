// frontend/src/pages/AccountInfoPage.tsx
import React, { useEffect, useState } from "react";
import {
    updateUserAttributes,
    confirmUserAttribute,
    sendUserAttributeVerificationCode,
    UpdateUserAttributesOutput
} from "aws-amplify/auth";

import { useAuthContextSwitch as useAuthContext} from "../context/useAuthContextSwitch.ts";

const AccountInfoPage: React.FC = () => {
    const { user, isSignedIn, displayName } = useAuthContext();

    // フォーム状態管理
    const [newEmail, setNewEmail] = useState("");
    const [confirmCode, setConfirmCode] = useState("");
    const [needConfirm, setNeedConfirm] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    // 初期メールアドレスを表示するなら（userAttributes を別途 fetchして保持など）
    // ここでは AmplifyAuthProvider で既に displayName = userAttributes.email を
    // 入れている例なので、表示だけする
    useEffect(() => {
        if (displayName) {
            console.log("Current email: ", displayName);
        }
    }, [displayName]);

    /**
     * メールアドレス更新
     */
    const handleUpdateEmail = async () => {
        setStatusMessage("");
        try {
            // userAttributes 更新
            const output: UpdateUserAttributesOutput = await updateUserAttributes({
                userAttributes: { email: newEmail },
            });

            if (output.email.nextStep.updateAttributeStep === "CONFIRM_ATTRIBUTE_WITH_CODE") {
                // Cognito 側が「新しいメールアドレスの確認コード」を送信している
                setNeedConfirm(true);
                setStatusMessage("確認コードを送信しました。届いたコードを入力し、確認ボタンを押してください。");
            } else {
                // コード不要な場合も(設定によっては)ある
                setStatusMessage("メールアドレスが更新されました。（確認不要）");
            }
        } catch (err: any) { //eslint-disable-line
            console.error("メールアドレス更新失敗: ", err);
            setStatusMessage(`更新エラー: ${err?.message || "不明なエラー"}`);
        }
    };

    /**
     * 確認コード送信(念のため再送)
     */
    const handleResendCode = async () => {
        setStatusMessage("");
        try {
            await sendUserAttributeVerificationCode({
                userAttributeKey: "email",
            });
            setStatusMessage("確認コードを再送信しました。メールをチェックしてください。");
        } catch (err: any) { //eslint-disable-line
            console.error("再送失敗: ", err);
            setStatusMessage(`コード再送エラー: ${err?.message || "不明なエラー"}`);
        }
    };

    /**
     * 確認コードを使って属性確定
     */
    const handleConfirmCode = async () => {
        setStatusMessage("");
        try {
            await confirmUserAttribute({
                userAttributeKey: "email",
                confirmationCode: confirmCode,
            });
            setStatusMessage("メールアドレス確認が完了しました。");
            setNeedConfirm(false);
            setConfirmCode("");
        } catch (err: any) { //eslint-disable-line
            console.error("確認失敗: ", err);
            setStatusMessage(`確認エラー: ${err?.message || "不明なエラー"}`);
        }
    };

    return (
        <div style={{ padding: "1rem" }}>
            {isSignedIn ? (
                <>
                    <h2>アカウント情報</h2>
                        <p>現在のログインID: { user?.userId || "unknown"}</p>
                        <p>現在のメールアドレス（表示名）: {displayName || "(未取得)"}</p>

                    <hr style={{ margin: "1rem 0" }} />

                    <h3>メールアドレス変更</h3>
                    <div style={{ margin: "0.5rem 0" }}>
                        <label>新しいメールアドレス: </label>
                        <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="例: newaddress@example.com"
                            style={{ marginRight: "0.5rem", width: "250px" }}
                        />
                        <button onClick={handleUpdateEmail}>更新</button>
                    </div>

                    {needConfirm && (
                        <div style={{ margin: "0.5rem 0", border: "1px solid #ccc", padding: "0.5rem" }}>
                            <label>メールに届いた確認コード:</label>
                            <input
                                type="text"
                                value={confirmCode}
                                onChange={(e) => setConfirmCode(e.target.value)}
                                style={{ marginRight: "0.5rem", marginLeft: "0.5rem" }}
                            />
                            <button onClick={handleConfirmCode}>確認する</button>
                            <button style={{ marginLeft: "1rem" }} onClick={handleResendCode}>
                                コード再送
                            </button>
                        </div>
                    )}

                    {/* ステータス表示 */}
                    {statusMessage && (
                        <div style={{ marginTop: "1rem", color: "#007bff" }}>{statusMessage}</div>
                    )}
                </>
            ) : (
                <p>ログインしてください。</p>
            )}

        </div>
    );
};

export default AccountInfoPage;
