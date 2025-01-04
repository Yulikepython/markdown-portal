// backend/src/middlewares/authIndex.ts
import { RequestHandler } from "express";
import { authenticateLocalUser } from "./authLocal";
import { authenticateDynamicJwt } from "./authDynamicJwt";

const isOffline = process.env.IS_OFFLINE === "true";

let authenticateUser: RequestHandler;

if (isOffline) {
    console.log("[authIndex] Using local mock auth.");
    authenticateUser = authenticateLocalUser;
} else {
    console.log("[authIndex] Using dynamic Cognito JWT auth.");
    authenticateUser = authenticateDynamicJwt;
}

export { authenticateUser };
