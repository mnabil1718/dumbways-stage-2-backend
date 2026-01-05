export class ClientError extends Error {
        statusCode: number;

        constructor(message: string, statusCode = 400) {
                super(message);
                this.statusCode = statusCode;
                this.name = 'ClientError';
        }
}

export class InvariantError extends ClientError {
        constructor(message: string) {
                super(message);
                this.name = 'InvariantError';
        }
}


export class AuthenticationError extends ClientError {
        constructor(message: string) {
                super(message, 401);
                this.name = 'AuthenticationError';
        }
}

export class AuthorizationError extends ClientError {
        constructor(message: string) {
                super(message, 403);
                this.name = 'AuthorizationError';
        }
}

export class NotFoundError extends ClientError {
        constructor(message: string) {
                super(message, 404);
                this.name = 'NotFoundError';
        }
}
