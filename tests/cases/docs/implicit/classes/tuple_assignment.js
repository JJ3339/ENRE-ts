class MyClass {
    func1() {
        /* Empty */
    }

    func2() {
        /* Empty */
    }
}

class MyClass2 {
    func3() {
        /* Empty */
    }
}

const {a, b} = {a: new MyClass(), b: new MyClass2()}

const [c, [d, e]] = [a.func1, [a.func2, b.func3]];

c();
d();
e();