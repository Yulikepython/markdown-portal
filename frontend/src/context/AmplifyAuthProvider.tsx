// AmplifyAuthProvider.tsx
import React, { useEffect, useState } from 'react';
import { AuthUser, getCurrentUser, fetchUserAttributes, signInWithRedirect, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { AuthEvents } from '../config/projectVars';
import { AuthContext } from './authContextCore';

export const AmplifyAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [userEmail, setUserEmail] = useState<string | undefined>(undefined);

    // ❶ 現在のユーザーを取得する共通関数
    const fetchCurrentUser = async () => {
        try {
            const currentUser = await getCurrentUser();
            setIsSignedIn(true);
            setUser(currentUser);
            const attributes = await fetchUserAttributes();
            setUserEmail(attributes.email);
        } catch {
            setIsSignedIn(false);
            setUser(null);
            setUserEmail(undefined);
        }
    };

    // ❷ マウント時に必ず 1回 fetchCurrentUser() を呼んでログイン状態を反映
    useEffect(() => {
        fetchCurrentUser(); // 最初に実行

        const unsubscribe = Hub.listen('auth', ({ payload }) => {
            switch (payload.event) {
                case AuthEvents.SIGNED_IN:
                case AuthEvents.TOKEN_REFRESH:
                    fetchCurrentUser().then();
                    break;
                case AuthEvents.SIGNED_OUT:
                    setUser(null);
                    setIsSignedIn(false);
                    setUserEmail(undefined);
                    break;
                // ...その他省略
            }
        });
        return () => unsubscribe();
    }, []);

    // ❸ すでにログイン済みの場合は signInWithRedirect() を呼ばない
    const login = async () => {
        if (isSignedIn) {
            console.warn("Already signed in. Skip signInWithRedirect().");
            return;
        }
        await signInWithRedirect();
    };

    const logout = async () => {
        await signOut();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isSignedIn,
                userEmail,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
