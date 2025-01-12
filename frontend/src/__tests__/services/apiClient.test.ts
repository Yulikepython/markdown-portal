import { describe, it, expect, vi } from 'vitest'
import axios from 'axios'
import { renderHook } from '@testing-library/react'
import { useApiClient } from '../../services/apiClient'

vi.mock('axios', () => {
  return {
        default: {
          create: vi.fn(),
            },
  }
})

describe('useApiClient', () => {
  it('getDocuments が正しくAPI取得する例', async () => {
        const mockGet = vi.fn().mockResolvedValue({ data: [{ slug: 'abc', content: 'Hello' }] })
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            ;(axios.create as vi.Mock).mockReturnValue({
              interceptors: { request: { use: vi.fn() } },
          get: mockGet,
            })

            const { result } = renderHook(() => useApiClient())

        const docs = await result.current.getDocuments()
            expect(mockGet).toHaveBeenCalledWith('/docs')
            expect(docs).toEqual([{ slug: 'abc', content: 'Hello' }])
          })
})