// src/context/AuthContext.amplify.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthUser, getCurrentUser,fetchUserAttributes, signInWithRedirect,signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import {AuthEvents} from '../config/projectVars';

interface AuthContextType {
    user: AuthUser | null;
    isSignedIn: boolean;
    userEmail?: string;
    login: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isSignedIn: false,
    userEmail: undefined,
    login: async () => {},
    logout: async () => {},
});

export const useAuthContext = () => useContext(AuthContext); //eslint-disable-line

export const AmplifyAuthProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                                 children,}) => {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [userEmail, setUserEmail] = useState<string | undefined>(undefined);

    const fetchCurrentUser = async () => {
        try {
            const currentUser = await getCurrentUser();
            setIsSignedIn(true);
            setUser(currentUser);
            const attributes = await fetchUserAttributes()
            setUserEmail(attributes.email);
        } catch {
            setIsSignedIn(false);
            setUser(null);
            setUserEmail(undefined);
        }
    };

    useEffect(() => {
        const unsubscribe = Hub.listen("auth", ({ payload }) => {
            switch (payload.event) {
                case AuthEvents.SIGNED_IN:
                    break;
                case AuthEvents.TOKEN_REFRESH:
                    fetchCurrentUser().then();
                    break;
                case AuthEvents.SIGNED_OUT:
                    setUser(null);
                    setIsSignedIn(false);
                    setUserEmail(undefined);
                    break;
                case AuthEvents.TOKEN_REFRESH_FAILURE:
                    console.log('failure while refreshing auth tokens.');
                    break;
                case AuthEvents.SIGN_IN_REDIRECT:
                    console.log('signInWithRedirect API has successfully been resolved.');
                    break;
                case AuthEvents.SIGN_IN_REDIRECT_FAILURE:
                    console.log('failure while trying to resolve signInWithRedirect API.');
                    break;
                case AuthEvents.CUSTOM_OAUTH_STATE:
                    console.log('custom OAuth state');
                    break;
                default:
                    break;
            }
        });
        return () => unsubscribe();
    }, []);

    const login = async () => {
        await signInWithRedirect();
        // or signInWithRedirect(), etc.
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
