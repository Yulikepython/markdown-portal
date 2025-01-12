import { Request, Response } from 'express';
import { DocumentServiceDynamo } from '../services/document';

export class DocumentController {

    /**
     * ドキュメント一覧を取得
     */
    static async getDocumentsOfLoggedInUser(req: Request, res: Response) {
        try {
            // if (!req.user?.id || req.user.id === 'anonymous') {
            //     return res.status(403).json({ message: "Authentication required" });
            // }

            const docs = await DocumentServiceDynamo.getDocumentsByOwnUser(req.user.id);
            res.json(docs);
        } catch (error) {
            console.error('Error in getDocuments:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    /**
     * 特定のドキュメントを取得 && 所有者のみ
     */
    static async getDocumentBySlugOfLoggedInUser(req: Request, res: Response) {
        try {
            // if (!req.user?.id || req.user.id === 'anonymous') {
            //     return res.status(403).json({ message: "Authentication required" });
            // }

            const doc = await DocumentServiceDynamo.getDocumentBySlugAndUserId(req.params.slug, req.user.id);
            res.json(doc);
        } catch (error) {
            console.error('Error in getDocumentById:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    /**
     * 特定のドキュメントを取得 && 公開のみ
     */
    static async getDocumentBySlugOfPublic(req: Request, res: Response) {
        try {
            const doc = await DocumentServiceDynamo.getPublicDocumentBySlug(req.params.slug);
            res.json(doc);
        } catch (error) {
            console.error('Error in getDocumentById:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    /**
     * 新規ドキュメントを作成
     */
    static async createDocument(req: Request, res: Response) {
        try {
            // if (!req.user?.id || req.user.id === 'anonymous') {
            //     return res.status(403).json({ message: "Authentication required" });
            // }

            const { content, isPublic } = req.body;

            // バリデーション
            if (!content) {
                return res.status(400).json({ message: "Content are required" });
            }

            const newDoc = await DocumentServiceDynamo.createDocument(content, req.user.id, isPublic);
            res.status(201).json(newDoc);
        } catch (error) {
            console.error('Error in createDocument:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    /**
     * ドキュメントを更新
     */
    static async updateDocument(req: Request, res: Response) {
        try {
            // if (!req.user?.id || req.user.id === 'anonymous') {
            //     return res.status(403).json({ message: "Authentication required" });
            // }

            const { content, isPublic } = req.body;
            const { slug } = req.params;

            // バリデーション
            if (!content) {
                return res.status(400).json({ message: "Content are required" });
            }

            // 所有者チェック
            // if (!DocumentServiceDynamo.isDocumentOwner(slug, req.user.id)) {
            //     return res.status(403).json({ message: "You don't have permission to update this document" });
            // }

            const updatedDoc = await DocumentServiceDynamo.updateDocument(slug, content, req.user.id, isPublic);
            if (updatedDoc) {
                res.json(updatedDoc);
            } else {
                res.status(404).json({ message: "Document not found" });
            }
        } catch (error) {
            console.error('Error in updateDocument:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    /**
     * ドキュメントを削除
     */
    static async deleteDocument(req: Request, res: Response) {
        try {
            // if (!req.user?.id || req.user.id === 'anonymous') {
            //     return res.status(403).json({ message: "Authentication required" });
            // }

            const { slug } = req.params;

            // 所有者チェック
            // if (!DocumentServiceDynamo.isDocumentOwner(id, req.user.id)) {
            //     return res.status(403).json({ message: "You don't have permission to delete this document" });
            // }

            const success = await DocumentServiceDynamo.deleteDocument(slug, req.user.id);
            if (success) {
                res.status(204).end();
            } else {
                res.status(404).json({ message: "Document not found" });
            }
        } catch (error) {
            console.error('Error in deleteDocument:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}