import axios from "axios";
import {useMemo} from "react";

const stage = process.env.NODE_ENV === "production" ? "" : "/dev";

export const useApiClient = (userId: string | undefined) => {
    return useMemo(() => {
        const apiClient = axios.create({
            baseURL: `http://localhost:3000${stage}/api`,
            headers: {
                "Content-Type": "application/json",
                "x-user-id": userId || "anonymous"
            },
        });

        return {
            getDocuments: async (): Promise<any[]> => {
                try {
                    const response = await apiClient.get("/docs");
                    return response.data;
                } catch (error) {
                    console.error("Error fetching documents:", error);
                    throw error;
                }
            },
            getDocumentById: async (doc_id: string): Promise<any> => {
                try {
                    const response = await apiClient.get(`/docs/${doc_id}`);
                    return response.data;
                } catch (error) {
                    console.error(`Error fetching document with ID ${doc_id}:`, error);
                    throw error;
                }
            },
            createDocument: async (title: string, content: string): Promise<any> => {
                try {
                    const response = await apiClient.post("/docs", { title, content });
                    return response.data;
                } catch (error) {
                    console.error("Error creating document:", error);
                    throw error;
                }
            },
            updateDocument: async (id: string, title: string, content: string): Promise<any> => {
                try {
                    const response = await apiClient.put(`/docs/${id}`, { title, content });
                    return response.data;
                } catch (error) {
                    console.error(`Error updating document with ID ${id}:`, error);
                    throw error;
                }
            },
            deleteDocument: async (id: string): Promise<void> => {
                try {
                    await apiClient.delete(`/docs/${id}`);
                } catch (error) {
                    console.error(`Error deleting document with ID ${id}:`, error);
                    throw error;
                }
            },
        };
    }, [userId]);
};
