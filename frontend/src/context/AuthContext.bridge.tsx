// src/context/AuthContext.bridge.tsx
import {
    AmplifyAuthProvider,
    useAuthContext as useAmplifyAuthContext,
} from "./AuthContext.amplify";
import {
    MockAuthProvider,
    useAuthContext as useMockAuthContext,
} from "./AuthContext.mock";

import {DevStage} from "../config/projectVars.ts";

/**
 * isOffline 判定: 例として VITE_API_STAGE === "local" or REACT_APP_USE_MOCK_AUTH === "true"
 */
const isOffline = import.meta.env.VITE_API_STAGE === DevStage.LOCAL
    || import.meta.env.REACT_APP_USE_MOCK_AUTH === "true";

/**
 * プロバイダ切り替えコンポーネント
 */
export const CombinedAuthProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                                  children,
                                                                              }) => {
    return isOffline ? (
        <MockAuthProvider>{children}</MockAuthProvider>
    ) : (
        <AmplifyAuthProvider>{children}</AmplifyAuthProvider>
    );
};

/**
 * useAuthContext フックを 1本化する
 */
export const useAuthContext = () => {
    return isOffline ? useMockAuthContext() : useAmplifyAuthContext(); //eslint-disable-line
};
