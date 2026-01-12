import crypto from "crypto";

export function hashResetToken(token: string): string {
        return crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");

}

export function generateResetToken(): { raw: string; hashed: string; } {
        const raw = crypto.randomBytes(32).toString("hex");

        const hashed = hashResetToken(raw);

        return { raw, hashed };
}

