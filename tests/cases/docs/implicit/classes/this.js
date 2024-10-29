class MyClass {
    func1() {
        /* Empty */
    }

    func2() {
        const a = this;
        a.func1();
    }
}

const a = new MyClass();
const b = a.func2;
b();                    // JSError: undefined is not an object (evaluating 'a.func1')