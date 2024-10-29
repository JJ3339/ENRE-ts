class B {
    funcB() {
        this.foo = this.func;
    }

    func() {
        /* Empty */
    }
}

class A extends B {
    funcA() {
        this.foo = this.func;
    }

    func() {
        /* Empty */
    }
}

const a = new A();
a.funcB();                      // this.foo = A.func
a.foo();

a.funcA();                      // this.foo = A.func
a.foo();