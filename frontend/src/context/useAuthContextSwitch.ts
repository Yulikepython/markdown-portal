// src/context/useAuthContextSwitch.ts
import { useAuthContext as useAmplifyAuthContext } from "./authContextCore";
import { useAuthContext as useMockAuthContext } from "./AuthContext.mock";
import { DevStage } from "../config/projectVars";

/**
 * isOffline 判定: 例として VITE_API_STAGE === "local" or REACT_APP_USE_MOCK_AUTH === "true"
 */
const isOffline =
    import.meta.env.VITE_API_STAGE === DevStage.LOCAL ||
    import.meta.env.REACT_APP_USE_MOCK_AUTH === "true";

/**
 * useAuthContext フックを 1本化する:
 *   - isOffline なら useMockAuthContext,
 *   - そうでなければ useAmplifyAuthContext
 */
/* eslint-disable react-hooks/rules-of-hooks */
export const useAuthContextSwitch = () => {
    return isOffline ? useMockAuthContext() : useAmplifyAuthContext();
};
