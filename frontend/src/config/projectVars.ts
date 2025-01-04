//開発・本番環境の切り替えで使用する変数
export const DevStage = {
    /** 開発環境（ローカル）*/LOCAL: 'local',
    /** 開発環境（Webサーバー）*/DEVELOPMENT: 'dev',
    /** 本番環境 */PRODUCTION: 'prod'
}

/** AmplifyのAuthenticationEvents*/
export const AuthEvents = {
    /** ログイン成功 */SIGNED_IN: 'signedIn',
    /** トークンの再取得*/TOKEN_REFRESH: 'tokenRefresh',
    /** ログアウト*/SIGNED_OUT: 'signedOut',
    /** トークン再取得失敗 */TOKEN_REFRESH_FAILURE: 'tokenRefresh_failure',
    /** ログイン & リダイレクト */SIGN_IN_REDIRECT: 'signInWithRedirect',
    /** ログイン & リダイレクト失敗 */SIGN_IN_REDIRECT_FAILURE: 'signInWithRedirect_failure',
    /** カスタム oAuthState*/CUSTOM_OAUTH_STATE: 'customOAuthState'
}

