class MyClass {
    constructor() {
        this.func1();
    }

    func1() {
        /* Empty */
    }

    func2() {
        this.func1();
    }
}

const a = new MyClass();
a.func2();