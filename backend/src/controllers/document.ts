import { Request, Response } from 'express';
import { DocumentService } from '../services/document';

export class DocumentController {
    /**
     * ドキュメント一覧を取得
     */
    static async getDocumentsOfLoggedInUser(req: Request, res: Response) {
        try {
            // if (!req.user?.id || req.user.id === 'anonymous') {
            //     return res.status(403).json({ message: "Authentication required" });
            // }

            const docs = await DocumentService.getDocumentsByOwnUser(req.user.id);
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

            const doc = DocumentService.getDocumentBySlugAndUserId(req.params.slug, req.user.id);
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
            console.log(req.params.slug);
            console.log('getDocumentBySlugOfPublic');


            const doc = DocumentService.getPublicDocumentBySlug(req.params.slug);
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

            const { content } = req.body;

            // バリデーション
            if (!content) {
                return res.status(400).json({ message: "Content are required" });
            }

            const newDoc = DocumentService.createDocument(content, req.user.id);
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
            console.log('isPublic:', isPublic);
            console.log('request: ', req.body);
            const { slug } = req.params;

            // バリデーション
            if (!content) {
                return res.status(400).json({ message: "Content are required" });
            }

            // 所有者チェック
            // if (!DocumentService.isDocumentOwner(slug, req.user.id)) {
            //     return res.status(403).json({ message: "You don't have permission to update this document" });
            // }

            const updatedDoc = DocumentService.updateDocument(slug, content, req.user.id, isPublic);
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
            // if (!DocumentService.isDocumentOwner(id, req.user.id)) {
            //     return res.status(403).json({ message: "You don't have permission to delete this document" });
            // }

            const success = DocumentService.deleteDocument(slug, req.user.id);
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

    /**
     * ドキュメントを公開にする
     * */
    static async publishDocument(req: Request, res: Response) {
        try {
            // if (!req.user?.id || req.user.id === 'anonymous') {
            //     return res.status(403).json({ message: "Authentication required" });
            // }

            const { slug } = req.params;

            // // 所有者チェック
            // if (!DocumentService.isDocumentOwner(id, req.user.id)) {
            //     return res.status(403).json({ message: "You don't have permission to modify this document" });
            // }

            const updatedDoc = DocumentService.makePublic(slug, req.user.id);
            if (updatedDoc) {
                res.json(updatedDoc);
            } else {
                res.status(404).json({ message: "Document not found" });
            }
        } catch (error) {
            console.error('Error in publishDocument:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    /**
     * ドキュメントを非公開にする
     * */
    static async unpublishDocument(req: Request, res: Response) {
        try {
            // if (!req.user?.id || req.user.id === 'anonymous') {
            //     return res.status(403).json({ message: "Authentication required" });
            // }

            const {slug} = req.params;

            // // 所有者チェック
            // if (!DocumentService.isDocumentOwner(id, req.user.id)) {
            //     return res.status(403).json({ message: "You don't have permission to modify this document" });
            // }

            const updatedDoc = DocumentService.makePrivate(slug, req.user.id);
            if (updatedDoc) {
                res.json(updatedDoc);
            } else {
                res.status(404).json({message: "Document not found"});
            }
        } catch (error) {
            console.error('Error in unpublishDocument:', error);
            res.status(500).json({message: "Internal server error"});
        }
    }
}