// src/context/AuthContext.mock.tsx (分けても良い)
import React, { createContext, useContext, useState } from "react";

export const LOCAL_USER_ID = "local-user-1234";
export const LOCAL_USER_EMAIL = "mockuser@example.com";

interface AuthContextType {
    user: { userId: string } | null;
    isSignedIn: boolean;
    displayName: string | undefined;
    login: () => void;
    logout: () => void;
}

// モック用
const AuthContext = createContext<AuthContextType>({
    user: null,
    isSignedIn: false,
    displayName: "",
    login: () => {},
    logout: () => {},
});

export const useAuthContext = () => useContext(AuthContext); //eslint-disable-line

export const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                              children,
                                                                          }) => {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [user, setUser] = useState<{ userId: string } | null>(null);

    const login = () => {
        setIsSignedIn(true);
        setUser({ userId: LOCAL_USER_ID });
    };

    const logout = () => {
        setIsSignedIn(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isSignedIn,
                displayName: isSignedIn ? LOCAL_USER_EMAIL : undefined,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
