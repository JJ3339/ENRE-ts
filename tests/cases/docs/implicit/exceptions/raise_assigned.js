class AError extends Error {
    constructor() {
        super();
    }
}

const a = AError;

throw new a();