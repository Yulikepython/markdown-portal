// frontend/src/pages/TermsOfUsePage.tsx
import React from "react";
import termsStyles from "../styles/TermsOfUsePage.module.scss";
import tableStyles from "../styles/tableCommon.module.scss"; // ← テーブル共通スタイルをインポート

const TermsOfUsePage: React.FC = () => {
    return (
        <div className={termsStyles.termsContainer}>
            <h1 className={termsStyles.termsTitle}>利用規約 (Terms of Use)</h1>

            <p>
                この利用規約（以下「本規約」といいます）は、「Markdown Portal」
                （以下「本サービス」といいます）を利用される方（以下「ユーザー」といいます）
                との間で適用されます。
            </p>

            <h2 className={termsStyles.termsSubtitle}>1. 総則</h2>
            <p>
                ユーザーは、本サービスを利用することで、本規約に同意したものとみなされます。
                ユーザーは本規約を確認・承諾のうえご利用ください。
            </p>
            <p>
                本サービスは
                <a
                    href="https://github.com/Yulikepython/markdown-portal/"
                    target="_blank"
                    rel="noreferrer"
                >
                    オープンソースプロジェクト（ソースコード公開先）
                </a>
                を元に構築されたサンプル・デモ的アプリケーションです。
                脆弱性が発見された場合も、開発者・運営者は責任を負いません。
                ご自身の責任においてご利用ください。
            </p>

            <h2 className={termsStyles.termsSubtitle}>2. 禁止事項</h2>
            <ul className={termsStyles.sectionList}>
                <li>他者のプライバシーや知的財産権、その他の権利を侵害する行為</li>
                <li>違法行為または公序良俗に反する行為</li>
                <li>本サービスの運営を妨げる行為</li>
                {/* 必要に応じて追加 */}
                <li>
                    本サービスを利用して公開または保存するコンテンツが
                    不適切・不道徳と運営者が判断した場合、事前通知なしで
                    データの削除やユーザーアカウントの削除を行う場合があります。
                </li>
            </ul>

            <h2 className={termsStyles.termsSubtitle}>3. 免責事項</h2>
            <p>
                本サービスの提供者は、サービス内容やユーザー投稿コンテンツ等に関して、
                いかなる保証も行いません。サービス利用に起因する損害、あるいは
                本サービスの脆弱性・不具合によって生じたトラブル等に関しましても、
                一切の責任を負わないものとします。
            </p>
            <p>
                また、本サービスはサンプル用途・試用目的で提供されており、機密情報や
                個人情報などは保存しないようご注意ください。本サービスに保存された
                データの漏洩・改ざん・削除等について、運営者は一切責任を負いません。
            </p>
            <p>
                不適切な内容を保存・公開していると運営者が判断した場合、ユーザーへの
                通知なくしてデータやアカウントを削除する場合があります。
                その結果生じる損害や不利益に対して、運営者は責任を一切負いません。
                不適切か否かの判断は運営者の独断により行われるものとします。
            </p>

            <h2 className={termsStyles.termsSubtitle}>4. コードの公開と免責</h2>
            <p>
                本サービスのソースコードは
                <a
                    href="https://github.com/Yulikepython/markdown-portal/"
                    target="_blank"
                    rel="noreferrer"
                >
                    GitHubリポジトリ
                </a>
                にて公開されています。ご自身の環境で導入・カスタマイズを行う場合も
                自己責任でお願いします。利用による損害や不具合等に対し、運営者は
                いかなる補償も行いません。
            </p>
            <p>
                改変や提案（Contribute）を行っていただくことは歓迎ですが、
                その結果生じる問題や損害に関して運営者は一切の責任を負いません。
            </p>

            <h2 className={termsStyles.termsSubtitle}>5. 規約の変更</h2>
            <p>
                本規約は、事前の通知なく変更される場合があります。変更後の規約は、
                本サービス内で掲載された時点から効力を有します。
            </p>

            <h2 className={termsStyles.termsSubtitle}>6. 準拠法および管轄裁判所</h2>
            <p>
                本規約の解釈や適用は日本法に準拠し、本サービスまたは本規約に関連して
                紛争が生じた場合、開発者または管理者の所在地を管轄する裁判所を
                専属的合意管轄裁判所とします。
            </p>

            {/* ▼ 更新履歴セクション（例）▼ */}
            <h2 className={termsStyles.termsSubtitle}>7. 更新履歴</h2>
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
                <tr>
                    <td>1.1.0</td>
                    <td>2025-01-16</td>
                    <td>
                        オープンソース公開情報や不適切コンテンツの削除対応などに関する追記
                    </td>
                </tr>
                {/* 必要に応じて追加 */}
                </tbody>
            </table>

            <p style={{ marginTop: "1.5rem" }}>以上</p>
        </div>
    );
};

export default TermsOfUsePage;
