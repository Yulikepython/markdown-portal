// src/context/CombinedAuthProvider.tsx
import React from "react";
import { AmplifyAuthProvider } from "./AmplifyAuthProvider";
import { MockAuthProvider } from "./AuthContext.mock";
import { DevStage } from "../config/projectVars";

// isOffline 判定
const isOffline =
    import.meta.env.VITE_API_STAGE === DevStage.LOCAL ||
    import.meta.env.REACT_APP_USE_MOCK_AUTH === "true";

/**
 * プロバイダ切り替えコンポーネント
 *   - isOffline なら MockAuthProvider,
 *   - そうでなければ AmplifyAuthProvider を使う
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
