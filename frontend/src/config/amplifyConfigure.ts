import { ResourcesConfig, Amplify } from "aws-amplify";
import { apiBaseUrl} from "../services/apiClient.ts";

const COGNITO_REGION = import.meta.env.VITE_COGNITO_REGION;
const COGNITO_USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const COGNITO_USER_POOL_CLIENT = import.meta.env.VITE_COGNITO_CLIENT_ID;
const COGNITO_DOMAIN_PREFIX = import.meta.env.VITE_COGNITO_DOMAIN;
const SIGNIN_URL = apiBaseUrl;
const SIGNOUT_URL = apiBaseUrl;

export const config: ResourcesConfig = {
    Auth: {
        Cognito: {
            userPoolId: COGNITO_USER_POOL_ID,
            userPoolClientId: COGNITO_USER_POOL_CLIENT,
            loginWith: {
                oauth: {
                    domain: `${COGNITO_DOMAIN_PREFIX}.auth.${COGNITO_REGION}.amazoncognito.com`,
                    scopes: ["openid"],
                    redirectSignIn: [SIGNIN_URL],
                    redirectSignOut: [SIGNOUT_URL],
                    responseType: "code",
                },
            },
        },
    },
};

Amplify.configure(config);
