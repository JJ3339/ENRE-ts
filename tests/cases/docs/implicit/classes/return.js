class MyClass {
    func2() {
        /* Empty */
    }

    func1() {
        return this.func2;
    }
}

const a = new MyClass();
const b = a.func1();
b();

a.func1()();