import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, fetchAuthSession, AuthUser } from 'aws-amplify/auth';

// Context が持つ情報の型
interface AuthContextType {
    user: AuthUser | null;             // AuthUser型などにしたほうがよい
    isSignedIn: boolean;
    userEmail: string | undefined;
}

interface TokenPayload {
    email?: string;
    sub: string;
    // 必要に応じて他のプロパティを追加
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isSignedIn: false,
    userEmail: undefined,
});

// Contextを使うためのカスタムフック
export const useAuthContext = () => useContext(AuthContext);

// 実際のProviderコンポーネント
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
    const [userEmail, setUserEmail] = useState<string | undefined>(undefined);

    useEffect(() => {
        const init = async () => {
            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
                // console.log("currentUser:", currentUser); @todo 削除
                const session = await fetchAuthSession();
                const payload = session.tokens?.idToken?.payload as TokenPayload;
                const email = payload?.email;

                setUserEmail(email);
                setIsSignedIn(!!currentUser);
            } catch (error) { //eslint-disable-line
                // console.error(error); //@todo 削除で良い
                setIsSignedIn(false);
            }
        };
        init().then();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isSignedIn,userEmail }}>
            {children}
        </AuthContext.Provider>
    );
};
