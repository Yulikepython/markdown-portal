// frontend/src/__tests__/pages/PublicDocumentPage.test.tsx
import { describe, test, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import PublicDocumentPage from '../../pages/PublicDocumentPage'
import { useApiClient } from '../../services/apiClient'
vi.mock('../../services/apiClient')

function renderPublicDocPage(slug: string) {
    return render(
        <MemoryRouter initialEntries={[`/documents/${slug}`]}>
            <Routes>
                <Route path="/documents/:slug" element={<PublicDocumentPage />} />
            </Routes>
        </MemoryRouter>
    )
}

describe('PublicDocumentPage', () => {
    beforeEach(() => {
        (useApiClient as vi.Mock).mockReturnValue({
            getPublicDocumentBySlug: vi.fn().mockResolvedValue({
                content: '# Public doc\nThis is content for the public doc',
            }),
        })
    })

    test('公開ドキュメントを fetch して表示する', async () => {
        renderPublicDocPage('public-abc123')

        expect(screen.getByText('Loading...')).toBeInTheDocument()

        await waitFor(() => {
            // Markdown の # 見出しが表示されているか
            expect(screen.getByText('Public doc')).toBeInTheDocument()
            expect(screen.queryByText('Loading...')).toBeNull() // ローディング非表示
        })
    })
})
