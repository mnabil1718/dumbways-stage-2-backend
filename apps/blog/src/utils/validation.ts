import { ZodError } from "zod";

export function formatZodErrorsAsObject(error: ZodError): Record<string, string> {
        console.error(error);

        return error.issues.reduce((acc, issue) => {
                const field = issue.path.join('.');
                let msg = issue.message;
                if (msg.includes(":")) {
                        msg = msg.split(":")[1].replace(/"/g, "").trim();
                }
                acc[field] = msg;
                return acc;
        }, {} as Record<string, string>);
}
