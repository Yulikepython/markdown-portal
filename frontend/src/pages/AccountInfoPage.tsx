// frontend/src/pages/AccountInfoPage.tsx
import React, { useEffect, useState } from "react";
import {
    updateUserAttributes,
    confirmUserAttribute,
    sendUserAttributeVerificationCode,
    UpdateUserAttributesOutput,
    fetchUserAttributes,
} from "aws-amplify/auth";

import { useAuthContextSwitch as useAuthContext } from "../context/useAuthContextSwitch.ts";

const AccountInfoPage: React.FC = () => {
    const {
        user,
        isSignedIn,
        displayName,        // これはAmplifyAuthProviderで「最新の検証済みメール」をセットしたもの
        reFetchDisplayName, // さきほどの「再取得関数」(無い場合は別途自前で書く)
    } = useAuthContext();

    /** -----------------------
    // 1) 表示用の「現在のメールアドレス」
    //    => ここでは "検証済み" のものをセットしている
     -----------------------
    */
    const [currentEmail, setCurrentEmail] = useState<string>("");

    useEffect(() => {
        // 初期表示時に displayName を currentEmail にコピー
        // (displayName は AmplifyAuthProvider 側が fetchUserAttributes した結果)
        setCurrentEmail(displayName ?? "");
    }, [displayName]);

    // -----------------------
    // 2) 更新フロー用ステート
    // -----------------------
    const [newEmail, setNewEmail] = useState("");
    const [confirmCode, setConfirmCode] = useState("");
    const [needConfirm, setNeedConfirm] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    // -----------------------
    // 3) メールアドレス更新
    // -----------------------
    const handleUpdateEmail = async () => {
        setStatusMessage("");
        try {
            // (A) updateUserAttributes で新アドレスを「未検証」で登録 → 認証コード送信される
            const output: UpdateUserAttributesOutput = await updateUserAttributes({
                userAttributes: { email: newEmail },
            });

            // (B) nextStep が CONFIRM_ATTRIBUTE_WITH_CODE なら、コード入力待ちへ
            if (output.email.nextStep.updateAttributeStep === "CONFIRM_ATTRIBUTE_WITH_CODE") {
                setNeedConfirm(true);
                setStatusMessage(
                    `新しいメール宛に確認コードを送りました。メールをチェックして、コードを入力してください。`
                );
            } else {
                // 確認不要設定の時など
                setStatusMessage("メールアドレスが更新されました。（確認コード不要の設定です）");

                // "自動的に検証済み扱い" になっているかもしれないので、念のため再取得
                await reFetchDisplayName?.();
                setCurrentEmail(displayName ?? newEmail);
            }
        } catch (err: any) { //eslint-disable-line
            console.error("メールアドレス更新失敗:", err);
            setStatusMessage(`更新エラー: ${err?.message || "不明なエラー"}`);
        }
    };

    // -----------------------
    // 4) 確認コード再送
    // -----------------------
    const handleResendCode = async () => {
        setStatusMessage("");
        try {
            await sendUserAttributeVerificationCode({ userAttributeKey: "email" });
            setStatusMessage("確認コードを再送信しました。メールをチェックしてください。");
        } catch (err: any) { //eslint-disable-line
            console.error("再送失敗:", err);
            setStatusMessage(`コード再送エラー: ${err?.message || "不明なエラー"}`);
        }
    };

    // -----------------------
    // 5) 確認コード入力 → confirmUserAttribute
    // -----------------------
    const handleConfirmCode = async () => {
        setStatusMessage("");
        try {
            await confirmUserAttribute({
                userAttributeKey: "email",
                confirmationCode: confirmCode,
            });

            setStatusMessage("メールアドレスの検証が完了しました。");

            // (A) コード検証できたので、UIで「現在のメールアドレス」を新しいものに更新したい
            //     ただし Cognito は非同期のため、念のため fetchUserAttributes し直して最新を取得
            if (reFetchDisplayName) {
                await reFetchDisplayName();
            } else {
                // refetch 関数がない場合、自前で fetchUserAttributes() → 取得後 setCurrentEmail()
                const attrs = await fetchUserAttributes();
                // attrs.email が現在の(=検証済み)メール
                setCurrentEmail(attrs.email || "");
            }

            setConfirmCode("");
            setNeedConfirm(false);
        } catch (err: any) { //eslint-disable-line
            console.error("確認失敗:", err);
            setStatusMessage(`確認エラー: ${err?.message || "不明なエラー"}`); //赤文字にしたい
        }
    };

    // -----------------------
    // 6) 描画
    // -----------------------
    if (!isSignedIn) {
        return (
            <div style={{ padding: "1rem" }}>
                <p>ログインしていません。メールアドレスを変更するにはログインしてください。</p>
            </div>
        );
    }

    return (
        <div style={{ padding: "1rem" }}>
            <h2>アカウント情報</h2>
            <p>ユーザー名(Cognito): {user?.userId || "unknown"}</p>

            {/* 検証済みのメールアドレスを表示 */}
            <p>現在のメールアドレス(検証済み): {currentEmail || "(未取得)"} </p>

            <hr style={{ margin: "1rem 0" }} />

            <h3>メールアドレス変更</h3>
            <div style={{ margin: "0.5rem 0" }}>
                <label>新しいメールアドレス: </label>
                <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="新しいメールアドレス"
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
        </div>
    );
};

export default AccountInfoPage;
