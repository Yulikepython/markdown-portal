// frontend/src/__tests__/context/AuthContext.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockAuthProvider, LOCAL_USER_ID, LOCAL_USER_EMAIL } from '../../context/AuthContext.mock'
import { useAuthContext } from '../../context/AuthContext.mock'

function TestComponent(): JSX.Element {
    const { user, isSignedIn, displayName, login, logout } = useAuthContext();

    return (
        <div>
            <p data-testid="userId">{user?.userId || 'no-user'}</p>
            <p data-testid="isSignedIn">{isSignedIn ? 'true' : 'false'}</p>
            <p data-testid="displayName">{displayName || 'no-email'}</p>
            <button onClick={login}>login</button>
            <button onClick={logout}>logout</button>
        </div>
    )
}

describe('AuthContext.mock', () => {
    it('未ログイン状態 -> login() -> ログイン状態になる', async () => {
        render(
            <MockAuthProvider>
                <TestComponent />
            </MockAuthProvider>
        )
        // 初期値
        expect(screen.getByTestId('userId').textContent).toBe('no-user')
        expect(screen.getByTestId('isSignedIn').textContent).toBe('false')
        expect(screen.getByTestId('displayName').textContent).toBe('no-email')

        // ログイン操作
        userEvent.click(screen.getByText('login'))

        // ログイン結果を待ち、検証
        await waitFor(() => {
            expect(screen.getByTestId('userId').textContent).toBe(LOCAL_USER_ID)
            expect(screen.getByTestId('isSignedIn').textContent).toBe('true')
            expect(screen.getByTestId('displayName').textContent).toBe(LOCAL_USER_EMAIL)
        })
    })
})
