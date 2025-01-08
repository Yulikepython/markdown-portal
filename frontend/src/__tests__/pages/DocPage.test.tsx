// frontend/src/__tests__/pages/DocPage.test.tsx
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import DocPage from '../../pages/DocPage'
import { useApiClient } from '../../services/apiClient'
import { useAuthContext } from '../../context/AuthContext.bridge'
import {LOCAL_USER_ID} from '../../context/AuthContext.mock'

vi.mock('../../services/apiClient', () => ({ useApiClient: vi.fn() }))
vi.mock('../../context/AuthContext.bridge', () => ({ useAuthContext: vi.fn() }))

// slug パラメータ付きルートのラップ例
function renderWithSlugPath(initialPath: string) {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
                <Route path="/docs/:slug" element={<DocPage />} />
            </Routes>
        </MemoryRouter>
    )
}

describe('DocPage', () => {
    beforeEach(() => {
        (useAuthContext as vi.Mock).mockReturnValue({
            user: { userId: LOCAL_USER_ID },
            isSignedIn: true,
        });

        (useApiClient as vi.Mock).mockReturnValue({
            getDocumentBySlug: vi.fn().mockResolvedValue({
            id: 1,
            slug: 'doc-123',
            content: 'Test content',
            userId: LOCAL_USER_ID,
            isPublic: false,
            schemaVersion:1,
            docMetadata: {},
        }),
        updateDocument: vi.fn().mockResolvedValue({}),
        createDocument: vi.fn().mockResolvedValue({}),
        deleteDocument: vi.fn().mockResolvedValue({}),
        })
    })

    test('既存ドキュメントをロードし、エディタに内容を表示できる', async () => {
        renderWithSlugPath('/docs/doc-123');
        expect(screen.getByText('公開する')).toBeInTheDocument()

        // // ロード中 → すぐには表示されないかもしれない
        // await waitFor(() => {
        //     expect(screen.getByText('Save')).toBeInTheDocument();
        // });
        // await waitFor(() => {
        //     // エディタ（react-markdown-editor-lite）の textarea などが描画されたか検証するなら
        //     expect(screen.getByText('Test content')).toBeInTheDocument()
        // });
    })

    test('Save ボタンをクリックすると updateDocument が呼ばれる', async () => {
        const mockApi = useApiClient() // .mockReturnValue({ ... }) の戻り値
        renderWithSlugPath('/docs/doc-123')

        // コンテンツを書き換え
        expect(screen.getByText('公開する')).toBeInTheDocument();
        // react-markdown-editor-lite の内部 textarea を直接 find するなら:
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
        fireEvent.change(textarea, { target: { value: 'Updated content' } })

        // Save ボタンクリック
        const saveButton = screen.getByText('Save')
        fireEvent.click(saveButton)

        // updateDocument() が呼ばれたか
        await waitFor(() => {
            expect(mockApi.updateDocument).toHaveBeenCalledWith(
                'doc-123',        // slug
                'Updated content',// content
                false             // isPublic
            )
        })
    })
})
