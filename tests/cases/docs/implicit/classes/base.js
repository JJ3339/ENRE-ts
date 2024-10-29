class A {
    func() {
        this.child();
    }
}

class B extends A {
    constructor() {
        super();
        this.child = this.func2;
    }

    func2() {
        /* Empty */
    }
}

class C extends A {
    constructor() {
        super();
        this.child = this.func2;
    }

    func2() {
        /* Empty */
    }
}

const b = new B();
b.func();

const c = new C();
c.func();