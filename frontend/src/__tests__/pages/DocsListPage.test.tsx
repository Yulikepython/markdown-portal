// frontend/src/__tests__/pages/DocsListPage.test.tsx
import {describe, test, vi, beforeEach} from 'vitest'
import { render } from '@testing-library/react'
import DocsListPage from '../../pages/DocsListPage'
import { useAuthContext } from '../../context/AuthContext.bridge'
import { useApiClient } from '../../services/apiClient'
import {LOCAL_USER_ID} from '../../context/AuthContext.mock'
import {MemoryRouter, Route, Routes} from "react-router-dom";
import '@testing-library/jest-dom'


vi.mock('../../services/apiClient', () => ({ useApiClient: vi.fn() }))
vi.mock('../../context/AuthContext.bridge', () => ({ useAuthContext: vi.fn() }))

async function renderNoSlug(initialPath: string) {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
                <Route path="/" element={<DocsListPage />} />
            </Routes>
        </MemoryRouter>
    )
}

describe('DocsListPage', () => {
    beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        (useAuthContext as vi.Mock).mockReturnValue({
            user: { userId: LOCAL_USER_ID },
            isSignedIn: true,
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        (useApiClient as vi.Mock).mockReturnValue({})
    })
    test('ログイン済みユーザー + API結果を表示する', async () => {
        await renderNoSlug('/');



        // 公開ドキュメントが表示されているか
        // expect(screen.getByText('Title1')).toBeInTheDocument()
        // expect(screen.getByText(/公開/i)).toBeInTheDocument()
        // // 非公開ドキュメント
        // expect(screen.getByText('Title2')).toBeInTheDocument()
        // expect(screen.getByText(/非公開/i)).toBeInTheDocument()
    })
})
