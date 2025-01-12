// frontend/src/pages/PrivacyPolicyPage.tsx
import React from "react";
import policyStyles from "../styles/PrivacyPolicyPage.module.scss";
import tableStyles from "../styles/tableCommon.module.scss"; // ← テーブル共通スタイルをインポート

const PrivacyPolicyPage: React.FC = () => {
    return (
        <div className={policyStyles.privacyContainer}>
            <h1 className={policyStyles.privacyTitle}>プライバシーポリシー</h1>

            <p>
                本アプリケーションでは、認証やサービス提供のためにユーザーの個人情報
                （例: ユーザーID、メールアドレスなど）を取得・保存します。
            </p>

            <h2 className={policyStyles.privacySubtitle}>1. 個人情報の取得と利用目的</h2>
            <ul className={policyStyles.sectionList}>
                <li>ユーザー認証を行うため（AWS Cognitoなどを使用）</li>
                <li>ユーザー自身が作成したドキュメントを本人のみが管理・編集できるようにするため</li>
                <li>ご本人へ連絡が必要な場合のため（パスワードリセットなど）</li>
            </ul>

            <h2 className={policyStyles.privacySubtitle}>2. 保存期間・利用停止について</h2>
            <p>
                ユーザーが長期間（6カ月以上）ログインを行っていない場合、管理者は
                当該ユーザーの個人情報と関連データを削除する場合があります。
                削除は事前に通知などは行わずに行われる場合があり、ユーザーに関する情報がすべて削除されることを予めご了承ください。
                ただし詳細はサービス運営方針に準じます。
            </p>

            <h2 className={policyStyles.privacySubtitle}>3. 削除される主な個人情報</h2>
            <ul className={policyStyles.sectionList}>
                <li>ユーザーID</li>
                <li>メールアドレス</li>
                <li>ユーザーが作成したドキュメント</li>
            </ul>

            {/* ▼ 更新履歴セクションを追加 ▼ */}
            <h2 className={policyStyles.privacySubtitle}>4. 更新履歴</h2>
            <table className={tableStyles.historyTable}>
                <thead>
                <tr>
                    <th>バージョン</th>
                    <th>更新日</th>
                    <th>変更内容</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>1.0.0</td>
                    <td>2025-01-12</td>
                    <td>初版を作成</td>
                </tr>
                {/* 必要に応じて追加 */}
                </tbody>
            </table>

            <p style={{ marginTop: "20px" }}>
                以上の内容は予告なく変更される場合があります。最新の情報は当ページにて告知します。
            </p>
        </div>
    );
};

export default PrivacyPolicyPage;
