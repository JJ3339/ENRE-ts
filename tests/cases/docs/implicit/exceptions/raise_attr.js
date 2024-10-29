class BError extends Error {
    constructor() {
        super();
    }
}

class A {
    static B = BError;
}

throw new A.B();