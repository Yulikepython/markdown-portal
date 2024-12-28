import { ResourcesConfig } from "aws-amplify";

const COGNITO_REGION = "ap-northeast-1";
const COGNITO_USER_POOL = "ap-northeast-poolid"; //ユーザープールID
const COGNITO_USER_POOL_CLIENT = "7dvpfam3cauclientidhere";

const COGNITO_DOMAIN_PREFIX = "domain-name";//ドメイン名

const SIGNIN_URL = "http://localhost:5173";
const SIGNOUT_URL = "http://localhost:5173";

export const config: ResourcesConfig = {
    Auth: {
        Cognito: {
            userPoolId: COGNITO_USER_POOL,
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
