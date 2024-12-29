import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {useApiClient} from "../services/apiClient";
import { useAuthContext } from "../context/AuthContext";


const DocsListPage: React.FC = () => {
    const [documents, setDocuments] = useState<any[]>([]); //eslint-disable-line
    const [error, setError] = useState<string | null>(null);
    const { user, isSignedIn } = useAuthContext();
    const api = useApiClient(user?.userId);

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const data = await api.getDocuments();
                setDocuments(data);
            } catch (err) {
                setError("Failed to fetch documents. Please try again.");
                console.error(err);
            }
        };
        fetchDocs().then();
    }, [user?.userId, api]);

    if (error) {
        return <div style={{ color: "red" }}>{error}</div>;
    }

    return (
        <div>
            {isSignedIn ? (
                <>
                    <h1>あなたのドキュメント一覧</h1>
                    <ul>
                        {documents.map((doc) => (
                            <li key={doc.id}>
                                <Link to={`/docs/${doc.id}`}>
                                    <strong>{doc.title}</strong>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </>
            ) : <div>ログインしてください</div>
            }
        </div>
    );
};

export default DocsListPage;
