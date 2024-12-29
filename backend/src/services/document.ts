import { Document } from '../types/document';
import { documents } from '../models/document';

import {v4 as uuidv4} from 'uuid';

export class DocumentService {
    /**
     * すべてのドキュメントを取得する
     * ユーザーが所有者のドキュメントのみ
     */
    static async getDocumentsByOwnUser(userId: string): Promise<Document[]> {
        return documents.filter(doc => DocumentService.isDocumentMatch_UserId(doc, userId));
    }

    /**
     * 指定されたSlugのドキュメントを取得する
     * ユーザーが所有者の場合のみ取得可能
     */
    static getDocumentBySlugAndUserId(slug: string, userId: string): Document | undefined {
        return documents.find(d => DocumentService.isDocumentMatch_SlugAndUserId(d, slug, userId) );
    }

    /**
     * 指定されたSlugのドキュメントを取得する
     * 公開フラグがtrueの場合のみ取得可能
     */
    static getPublicDocumentBySlug(slug: string): Document | undefined {
        return documents.find(d => DocumentService.isDocumentMatch_SlugAndPublic(d, slug));
    }

    /**
     * 新しいドキュメントを作成する
     */
    static createDocument(content: string, userId: string): Document {
        const newDoc: Document = {
            id: (documents.length + 1).toString(), //increment_id
            content,
            userId,
            isPublic: false,
            slug: this.generateSlug(),
        };
        documents.push(newDoc);
        return newDoc;
    }

    /**
     * 指定されたSlugのドキュメントを更新する
     * ユーザーが所有者の場合のみ更新可能
     */
    static updateDocument(slug: string, content: string, userId: string, isPublic: boolean): Document | undefined {
        const doc = documents.find(d => DocumentService.isDocumentMatch_SlugAndUserId(d, slug, userId));
        if (doc) {
            doc.content = content;
            doc.isPublic = isPublic;
            return doc;
        }
        return undefined;
    }

    /**
     * 指定されたslugのドキュメントを削除する
     * ユーザーが所有者の場合のみ削除可能
     */
    static deleteDocument(slug: string, userId: string): boolean {
        const index = documents.findIndex(d => DocumentService.isDocumentMatch_SlugAndUserId(d, slug, userId));
        if (index !== -1) {
            documents.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * ドキュメントを公開する
     * */
    static makePublic(slug: string, userId: string): Document | undefined {
        const doc = documents.find(d => DocumentService.isDocumentMatch_SlugAndUserId(d, slug, userId));
        if (doc) {
            doc.isPublic = true;
            return doc;
        }
        return undefined;
    }

    /**
     * ドキュメントを非公開にする
     * */
    static makePrivate(slug: string, userId: string): Document | undefined {
        const doc = documents.find(d => DocumentService.isDocumentMatch_SlugAndUserId(d, slug, userId));
        if (doc) {
            doc.isPublic = false;
            return doc;
        }
        return undefined;
    }


    /**
     * タイトルからスラグを生成する
     * @private
     */
    private static generateSlug(): string {
        return uuidv4();
    }

    /**
     * ユーザーIDがマッチするかどうかを確認する
     * */
    static isDocumentMatch_UserId(document: Document, userId: string): boolean {
        return document.userId === userId;
    }

    /**
     * ドキュメントの所有者を確認する
     */
    static isDocumentMatch_SlugAndUserId(document: Document, slug: string, userId: string): boolean {
        return document.slug === slug && DocumentService.isDocumentMatch_UserId(document, userId);
    }

    /**
     * ドキュメントのスラッグと公開フラグを確認する
     * */
    static isDocumentMatch_SlugAndPublic(document: Document, slug: string): boolean {
        return document.slug === slug && document.isPublic;
    }
}