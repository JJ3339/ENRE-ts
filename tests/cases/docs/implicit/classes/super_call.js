class A {
    constructor() {
        /* Empty */
    }
}

class B extends A {
    constructor() {
        super();
    }
}

class C extends B {
    constructor() {
        super();
    }
}

const c = new C();