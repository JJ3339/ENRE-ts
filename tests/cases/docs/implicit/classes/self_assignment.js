class A {
    func() {
        /* Empty */
    }
}

class B {
    constructor(a) {
        this.a = a;
        this.b = this.func2;
    }

    func() {
        this.a.func();
        this.b();
    }

    func2() {
        /* Empty */
    }
}

const a = new A();
const b = new B(a);
b.func();