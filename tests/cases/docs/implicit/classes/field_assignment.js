function func2() {
    /* Empty */
}

class A {
    constructor() {
        this.func = func1;          // `this` is not used, thus does not refer to A.func1
        this.func();                // JSError: Can't find variable: func1

        this.func3 = func2;         // Refers to <File file0.js>.func2
        this.func3();
    }

    func1() {
        /* Empty */
    }

    func2() {
        /* Empty */
    }
}

new A();