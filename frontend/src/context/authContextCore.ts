// authContextCore.ts
import { createContext, useContext } from "react";
import { AuthUser } from "aws-amplify/auth";


export interface AuthContextType {
    user: AuthUser | null;
    isSignedIn: boolean;
    displayName: string | undefined;
    login: () => Promise<void>;
    logout: () => Promise<void>;
}

/** Context本体 */
export const AuthContext = createContext<AuthContextType>({
    user: null,
    isSignedIn: false,
    displayName: undefined,
    login: async () => {},
    logout: async () => {},
});

/** カスタムフック */
export const useAuthContext = () => useContext(AuthContext);
