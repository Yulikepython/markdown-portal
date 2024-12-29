import { Document } from '../types/document';

// サンプルデータ
export const documents: Document[] = [
    {
        id: "1",
        content: "This is the first document.",
        userId: "27640aa8-9041-7002-c509-d69eb623bffb",
        isPublic: false,
        slug: "052bb610-7dc3-4220-af0a-cb13ad04e42c"
    },
    {
        id: "2",
        content: "# TEST title test    This is the second document.",
        userId: "user2",
        isPublic: true,
        slug: "a7252e70-2799-4b80-b8ee-a2ca2231c660"
    },
];

export async function fetchDocuments(): Promise<Document[]> {
    return documents;
}