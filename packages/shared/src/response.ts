export type APIResponse<T> = |
{
        success: true;
        message: string;
        data?: T;
} | {
        success: false;
        message: string;
        errors?: Record<string, string>;
}

export const ok = <T>(message: string, data?: T): APIResponse<T> => ({
        success: true,
        message,
        data,
});

export const fail = (message: string, errors?: Record<string, string>): APIResponse<never> => ({
        success: false,
        message,
        errors,
});

