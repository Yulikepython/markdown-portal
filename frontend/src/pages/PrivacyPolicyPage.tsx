// frontend/src/pages/PrivacyPolicyPage.tsx

import React from "react";

import styles from "../styles/PrivacyPolicyPage.module.scss";

const PrivacyPolicyPage: React.FC = () => {
    return (
        <div className={styles.privacyContainer}>
            <h1 className={styles.privacyTitle}>プライバシーポリシー</h1>

            <p>
                本アプリケーションでは、認証やサービス提供のためにユーザーの個人情報（例: ユーザーID、メールアドレスなど）を取得・保存します。
            </p>

            <h2 className={styles.privacySubtitle}>1. 個人情報の取得と利用目的</h2>
            <ul className={styles.sectionList}>
                <li>ユーザー認証を行うため（AWS Cognitoなどを使用）</li>
                <li>ユーザー自身が作成したドキュメントを本人のみが管理・編集できるようにするため</li>
                <li>ご本人へ連絡が必要な場合のため（パスワードリセットなど）</li>
            </ul>

            <h2 className={styles.privacySubtitle}>2. 保存期間・利用停止について</h2>
            <p>
                ユーザーが6ヶ月以上ログインを行っていない場合、管理者は該当ユーザーの個人情報と関連するデータを削除できるものとします。
                <br/>
                削除は事前に通知することなく行われます。該当のデータは復元できませんのでご注意ください。
            </p>

            <h2 className={styles.privacySubtitle}>3. 削除される主な個人情報</h2>
            <ul className={styles.sectionList}>
                <li>ユーザーID</li>
                <li>メールアドレス</li>
                <li>ユーザーが作成したドキュメント</li>
            </ul>

            <p style={{marginTop: "20px"}}>
                なお、以上の内容は予告なく変更される場合があります。最新の情報は当ページにて告知します。
            </p>
        </div>
    );
};

export default PrivacyPolicyPage;
