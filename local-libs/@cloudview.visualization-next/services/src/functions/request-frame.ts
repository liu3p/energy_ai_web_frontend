export class RequestFrame {
    private finished = true;
    private id: number | null = null;

    next(callback: (...args) => any | void): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                if (this.finished) {
                    this.finished = false;
                    this.id = requestAnimationFrame(async () => {
                        try {
                            await callback();
                            resolve();
                        } catch (e) {
                            reject(e);
                        } finally {
                            this.finished = true;
                        }
                    });
                } else {
                    resolve();
                }
            } catch (e) {
                reject(e);
                this.finished = true;
            }
        });
    }

    cancel() {
        try {
            cancelAnimationFrame(this.id!);
        } finally {
            this.finished = true;
        }
    }
}

export const requestFrame = new RequestFrame();
