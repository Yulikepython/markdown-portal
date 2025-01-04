export interface Document {
    id: number;
    content: string;
    isPublic: boolean;
    slug: string;
    userId: string;
    schemaVersion: number;
}