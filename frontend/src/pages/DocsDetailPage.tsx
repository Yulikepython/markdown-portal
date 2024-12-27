import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDocumentById } from "../services/apiClient";

const DocsDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [document, setDocument] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDocument = async () => {
            if (!id) return;
            try {
                const data = await getDocumentById(id);
                setDocument(data);
            } catch (err) {
                setError("Failed to load the document.");
                console.error(err);
            }
        };
        fetchDocument();
    }, [id]);

    if (error) {
        return <div style={{ color: "red" }}>{error}</div>;
    }

    if (!document) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>{document.title}</h1>
            <p>{document.content}</p>
        </div>
    );
};

export default DocsDetailPage;
