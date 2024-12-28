import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

// Context が持つ情報の型
interface AuthContextType {
    user: any;             // AuthUser型などにしたほうがよい
    isSignedIn: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isSignedIn: false
});

// Contextを使うためのカスタムフック
export const useAuthContext = () => useContext(AuthContext);

// 実際のProviderコンポーネント
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [isSignedIn, setIsSignedIn] = useState<boolean>(false);

    useEffect(() => {
        const init = async () => {
            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
                const session = await fetchAuthSession();
                console.log("session:", session);
                setIsSignedIn(!!currentUser);
            } catch (error) {
                console.error(error);
                setIsSignedIn(false);
            }
        };
        init();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isSignedIn }}>
            {children}
        </AuthContext.Provider>
    );
};
