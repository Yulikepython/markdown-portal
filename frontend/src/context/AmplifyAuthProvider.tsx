// AmplifyAuthProvider.tsx
import React, { useEffect, useState } from 'react';
import { FetchUserAttributesOutput, fetchUserAttributes , AuthUser, getCurrentUser, signInWithRedirect, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { AuthEvents } from '../config/projectVars';
import { AuthContext } from './authContextCore';

export const AmplifyAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [displayName, setDisplayName] = useState<string | undefined>(undefined);

    // ❶ 現在のユーザーを取得する共通関数
    const fetchCurrentUser = async () => {
        try {
            const currentUser = await getCurrentUser();
            const userAttributes: FetchUserAttributesOutput = await fetchUserAttributes();
            setIsSignedIn(true);
            setUser(currentUser);
            setDisplayName(userAttributes?.email || "匿名ユーザー");
        } catch {
            setIsSignedIn(false);
            setUser(null);
        }
    };

    // ❷ マウント時に必ず 1回 fetchCurrentUser() を呼んでログイン状態を反映
    useEffect(() => {
        fetchCurrentUser().then();

        const unsubscribe = Hub.listen('auth', ({ payload }) => {
            switch (payload.event) {
                case AuthEvents.SIGNED_IN:
                    console.log('Signed in event received.');
                    break;
                case AuthEvents.TOKEN_REFRESH:
                    fetchCurrentUser().then();
                    break;
                case AuthEvents.SIGNED_OUT:
                    setUser(null);
                    setIsSignedIn(false);
                    break;
                case AuthEvents.SIGN_IN_REDIRECT:
                    console.log('Sign in redirect event received.');
                    break;
                default:
                    console.log('Unhandled auth event:', payload.event);
                    break;
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
                displayName,
                login,
                logout,
                reFetchDisplayName: fetchCurrentUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
