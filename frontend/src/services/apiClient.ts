// apiClient.ts
import axios from "axios";
import { fetchAuthSession, AuthSession } from "aws-amplify/auth";
import { useMemo } from "react";

const stage: string = import.meta.env.VITE_API_STAGE ? `/${import.meta.env.VITE_API_STAGE}` : "";
export const useApiClient = () => {
    return useMemo( () => {
        const apiClient = axios.create({
            baseURL: `http://localhost:3000${stage}/api`,
            headers: {
                "Content-Type": "application/json",
            },
        });

        apiClient.interceptors.request.use(async (config) => {
            try {
                const session: AuthSession = await fetchAuthSession();
                const idToken = session?.tokens?.idToken;
                config.headers.Authorization = `Bearer ${idToken}`;
            } catch (err) {
                console.warn("No current session found:", err);
            }
            return config;
        });

        return {
            getDocuments: async (): Promise<any[]> => { //eslint-disable-line
                try {
                    const response = await apiClient.get("/docs");
                    return response.data;
                } catch (error) {
                    console.error("Error fetching documents:", error);
                    throw error;
                }
            },
            getDocumentBySlug: async (doc_slug: string): Promise<any> => { //eslint-disable-line
                try {
                    const response = await apiClient.get(`/docs/${doc_slug}`);
                    return response.data;
                } catch (error) {
                    console.error(`Error fetching document with ID ${doc_slug}:`, error);
                    throw error;
                }
            },
            createDocument: async (content: string, isPublic: boolean): Promise<any> => { //eslint-disable-line
                try {
                    const response = await apiClient.post("/docs", { content, isPublic });
                    return response.data;
                } catch (error) {
                    console.error("Error creating document:", error);
                    throw error;
                }
            },
            updateDocument: async (doc_slug: string, content: string, isPublic: boolean): Promise<any> => { //eslint-disable-line
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
            getPublicDocumentBySlug: async (doc_slug: string): Promise<any> => { //eslint-disable-line
                try {
                    const response = await apiClient.get(`/documents/${doc_slug}`);
                    return response.data;
                } catch (error) {
                    console.error(`Error fetching document with ID ${doc_slug}:`, error);
                    throw error;
                }
            },
        };
    }, []);
};
