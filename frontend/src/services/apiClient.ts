import axios from "axios";
import {useMemo} from "react";

const stage: string = import.meta.env.VITE_API_STAGE ? `/${import.meta.env.VITE_API_STAGE}` : "";
console.log('stage from env: ', stage);
export const useApiClient = (userId: string | undefined) => {
    return useMemo(() => {
        const apiClient = axios.create({
            baseURL: `http://localhost:3000${stage}/api`,
            headers: {
                "Content-Type": "application/json",
                "x-user-id": userId || "anonymous"
            },
        });

        apiClient.interceptors.response.use(
            response => response,
            error => {
                if (axios.isAxiosError(error) && error.response?.status === 403) {
                    // グローバルなログ記録
                    console.error("Permission denied");

                }
                return Promise.reject(error);
            }
        );

        return {
            getDocuments: async (): Promise<any[]> => {
                console.log('apiClients: ', apiClient);
                try {
                    const response = await apiClient.get("/docs");
                    return response.data;
                } catch (error) {
                    console.error("Error fetching documents:", error);
                    throw error;
                }
            },
            getDocumentBySlug: async (doc_slug: string): Promise<any> => {
                try {
                    const response = await apiClient.get(`/docs/${doc_slug}`);
                    return response.data;
                } catch (error) {
                    console.error(`Error fetching document with ID ${doc_slug}:`, error);
                    throw error;
                }
            },
            createDocument: async (content: string): Promise<any> => {
                try {
                    const response = await apiClient.post("/docs", { content });
                    return response.data;
                } catch (error) {
                    console.error("Error creating document:", error);
                    throw error;
                }
            },
            updateDocument: async (doc_slug: string, content: string, isPublic: boolean): Promise<any> => {
                try {
                    const response = await apiClient.put(`/docs/${doc_slug}`, { content, isPublic });
                    return response.data;
                } catch (error) {
                    console.error(`Error updating document with ID ${doc_slug}:`, error);
                    throw error;
                }
            },
            deleteDocument: async (doc_slug: string): Promise<void> => {
                try {
                    await apiClient.delete(`/docs/${doc_slug}`);
                } catch (error) {
                    console.error(`Error deleting document with ID ${doc_slug}:`, error);
                    throw error;
                }
            },
            getPublicDocumentBySlug: async (doc_slug: string): Promise<any> => {
                try {
                    const response = await apiClient.get(`/documents/${doc_slug}`);
                    return response.data;
                } catch (error) {
                    console.error(`Error fetching document with ID ${doc_slug}:`, error);
                    throw error;
                }
            },
        };
    }, [userId]);
};
