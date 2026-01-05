import { ZodError } from "zod";

export function formatZodErrorsAsObject(error: ZodError) {
        return error.issues.reduce((acc, issue) => {
                const field = issue.path.join('.');
                const msg = issue.message.split(":")[1].replace(/"/g, "").trim();
                acc[field] = msg;
                return acc;
        }, {} as Record<string, string>);
}
