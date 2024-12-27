import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDocuments } from "../services/apiClient";

const DocsListPage: React.FC = () => {
    const [documents, setDocuments] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const data = await getDocuments();
                setDocuments(data);
            } catch (err) {
                setError("Failed to fetch documents. Please try again.");
                console.error(err);
            }
        };
        fetchDocs();
    }, []);

    if (error) {
        return <div style={{ color: "red" }}>{error}</div>;
    }

    return (
        <div>
            <h1>Documents</h1>
            <ul>
                {documents.map((doc) => (
                    <li key={doc.id}>
                        <Link to={`/docs/${doc.id}`}>
                            <strong>{doc.title}</strong>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DocsListPage;
