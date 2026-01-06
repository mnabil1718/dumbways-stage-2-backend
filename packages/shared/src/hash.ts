import * as bcrypt from "bcrypt";

export async function hash(plain_text: string, salt: number = 10): Promise<string> {
        return bcrypt.hash(plain_text, salt);
}

export async function compare(plain_text: string, hashed_text: string): Promise<boolean> {
        const res = await bcrypt.compare(plain_text, hashed_text);
        if (!res) {
                return false;
        }

        return true;
} 
