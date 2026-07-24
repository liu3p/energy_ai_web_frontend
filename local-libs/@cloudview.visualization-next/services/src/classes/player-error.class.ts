export class PlayerError extends Error {
    template: string;
    params?: Record<string, string | number>;
    reason?: PlayerError | unknown;

    constructor(
        message: string,
        template: string,
        params?: Record<string, string | number>,
        reason?: PlayerError | unknown
    ) {
        super(message);
        this.template = template;
        this.params = params;
        this.reason = reason;
    }
}
