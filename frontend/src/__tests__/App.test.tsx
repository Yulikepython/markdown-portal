// src/__tests__/App.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react'
import App from '../App'
import '@testing-library/jest-dom'


// 必要なエクスポートを部分モックするための設定
vi.mock('../context/useAuthContextSwitch', async (importOriginal) => {
    const actual = (await importOriginal()) as object;
  return { ...actual, useAuthContextSwitch: () => ({ isSignedIn: true, user: { userId: 'test-user' }, login: vi.fn(), logout: vi.fn() }) }
})

// 2) apiClient をモック (必要なら)
vi.mock('../services/apiClient', () => {
    return {
        useApiClient: () => ({
            getDocuments: vi.fn().mockResolvedValue([
                { slug: 'doc-001', content: '# Title1\nDoc1 content', isPublic: true },
            ]),
            // ...
        }),
    }
})

describe('App', () => {
    beforeEach(() => {
        // もしURLを変えたいなら pushState
        window.history.pushState({}, '', '/') // ルートへ
    })

    it('初期表示: DocsListPage が表示される（ドキュメント一覧）', async () => {
        render(<App />)
        // docs一覧ページは "ドキュメント一覧" を表示している想定
        // useApiClient().getDocuments → モックが1件返す

        // screen.debug() で中身を確認してみると良い
        expect(await screen.findByText('ドキュメント一覧')).toBeInTheDocument()
        expect(screen.getByText('Title1')).toBeInTheDocument()
    })

    it('「/docs/new」へ遷移した場合、DocPage のエディタが表示されるか', async () => {
        // ルート変更
        window.history.pushState({}, '', '/docs/new')

        render(<App />)
        // DocPage が描画 → "Save"ボタンあり
        expect(await screen.findByText('Save')).toBeInTheDocument()
    })
})
