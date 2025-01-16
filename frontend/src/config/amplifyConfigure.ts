import { ResourcesConfig, Amplify } from "aws-amplify";

const COGNITO_REGION = import.meta.env.VITE_COGNITO_REGION;
const COGNITO_USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const COGNITO_USER_POOL_CLIENT = import.meta.env.VITE_COGNITO_CLIENT_ID;
const COGNITO_DOMAIN_PREFIX = import.meta.env.VITE_COGNITO_DOMAIN;
const SIGNIN_URL = import.meta.env.VITE_SIGNIN_URL || "http://localhost:5173";
const SIGNOUT_URL = import.meta.env.VITE_SIGNOUT_URL || "http://localhost:5173";

export const config: ResourcesConfig = {
    Auth: {
        Cognito: {
            userPoolId: COGNITO_USER_POOL_ID,
            userPoolClientId: COGNITO_USER_POOL_CLIENT,
            loginWith: {
                oauth: {
                    domain: `${COGNITO_DOMAIN_PREFIX}.auth.${COGNITO_REGION}.amazoncognito.com`,
                    scopes: [
                        "openid",
                        "aws.cognito.signin.user.admin",
                    ],
                    redirectSignIn: [SIGNIN_URL],
                    redirectSignOut: [SIGNOUT_URL],
                    responseType: "code",
                },
            },
            userAttributes: {
                email: {required: true},
            }
        },
    },
};

Amplify.configure(config);
