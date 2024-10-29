class MyClass {
    func3() {
        /* Empty */
    }

    func2(a) {
        a();
    }

    func1(a, b) {
        a(b);
    }
}

const a = new MyClass();
a.func1(a.func2, a.func3);