import "dotenv/config";

export const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);


export interface DecodedPayload {
        sub: string;
        role: string;
}


