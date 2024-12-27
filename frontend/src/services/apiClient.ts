import axios from "axios";

const stage = process.env.NODE_ENV === "production" ? "" : "/dev";

// Axios インスタンスを作成
const apiClient = axios.create({
    baseURL: `http://localhost:3000${stage}/api`, // API Gateway のエンドポイント
    headers: { "Content-Type": "application/json" },
});

// ドキュメント一覧取得
export const getDocuments = async (): Promise<any[]> => {
    try {
        const response = await apiClient.get("/docs");
        return response.data; // サーバーからのデータをそのまま返す
    } catch (error) {
        console.error("Error fetching documents:", error);
        throw error; // 呼び出し元でエラーを処理
    }
};

// ID指定でドキュメント取得
export const getDocumentById = async (id: string): Promise<any> => {
    try {
        const response = await apiClient.get(`/docs/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching document with ID ${id}:`, error);
        throw error;
    }
};

// 新規ドキュメント作成
export const createDocument = async (title: string, content: string): Promise<any> => {
    try {
        const response = await apiClient.post("/docs", { title, content });
        return response.data;
    } catch (error) {
        console.error("Error creating document:", error);
        throw error;
    }
};

// ドキュメント更新
export const updateDocument = async (id: string, title: string, content: string): Promise<any> => {
    try {
        const response = await apiClient.put(`/docs/${id}`, { title, content });
        return response.data;
    } catch (error) {
        console.error(`Error updating document with ID ${id}:`, error);
        throw error;
    }
};

// ドキュメント削除
export const deleteDocument = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/docs/${id}`);
    } catch (error) {
        console.error(`Error deleting document with ID ${id}:`, error);
        throw error;
    }
};
