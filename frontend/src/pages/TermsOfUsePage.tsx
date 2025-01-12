// frontend/src/pages/TermsOfUsePage.tsx

import React from "react";
import styles from "../styles/TermsOfUsePage.module.scss";

const TermsOfUsePage: React.FC = () => {
    return (
        <div className={styles.termsContainer}>
            <h1 className={styles.termsTitle}>利用規約 (Terms of Use)</h1>

            <p>
                この利用規約（以下「本規約」といいます）は、「Markdown Portal」（以下「本サービス」といいます）を利用される方（以下「ユーザー」といいます）との間で適用されます。
            </p>

            <h2 className={styles.termsSubtitle}>1. 総則</h2>
            <p>
                ユーザーは、本サービスを利用することで、本規約に同意したものとみなされます。ユーザーは本規約を確認・承諾のうえご利用ください。
            </p>

            <h2 className={styles.termsSubtitle}>2. 禁止事項</h2>
            <ul className={styles.sectionList}>
                <li>他者のプライバシーや知的財産権、または権利を侵害する行為</li>
                <li>違法行為または公序良俗に反する行為</li>
                <li>本サービスの運営を妨げる行為</li>
                {/* 必要に応じて追加 */}
            </ul>

            <h2 className={styles.termsSubtitle}>3. 免責事項</h2>
            <p>
                本サービスの提供者は、サービス内容やユーザーが投稿したコンテンツなどに関して、いかなる保証も行いません。サービス利用に起因する損害について、一切の責任を負わないものとします。
            </p>

            <h2 className={styles.termsSubtitle}>4. 規約の変更</h2>
            <p>
                本規約は、事前の通知なく変更される場合があります。変更後の規約は、本サービス内で掲載された時点から効力を有します。
            </p>

            <h2 className={styles.termsSubtitle}>5. 準拠法および管轄裁判所</h2>
            <p>
                本規約の解釈や適用は、日本法に準拠するものとし、本サービスまたは本規約に関連して紛争が生じた場合、開発者または管理者の所在地を管轄する裁判所を専属的合意管轄裁判所とします。
            </p>

            <p style={{ marginTop: "1.5rem" }}>
                以上
            </p>
        </div>
    );
};

export default TermsOfUsePage;
