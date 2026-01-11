import { jwtVerify, SignJWT } from "jose";
import { AuthorizationError } from "./error";

export type JwtPayload = {
        sub: string; // RFC 7519
        role: string;
}

export const generateJWT = async (payload: JwtPayload, secret: Uint8Array<ArrayBuffer>): Promise<string> => {
        return await new SignJWT(payload)
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('15m')
                .sign(secret);
}

export const verifyJWT = async (jwt: string, secret: Uint8Array<ArrayBuffer>): Promise<JwtPayload> => {

        try {
                const { payload } = await jwtVerify<JwtPayload>(jwt, secret);
                return payload;
        } catch (error) {
                throw new AuthorizationError("invalid or expired token");
        }

}

