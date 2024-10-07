function foo() {
    return () => {
        /* Empty */
    }
}

class Foo {
    /**
     * When a class is 'called', it is actually the
     * constructor that is being called.
     */
    constructor() {
        /* Empty */
    }

    method0() {
        /* Empty */
    }
}

const baz = {
    prop: () => {
        /* Empty */
    }
}

const bar = foo();
bar();

new Foo().method0();

baz.prop();

/**
 * A function can also be called with `new`.
 * This is a convenient way to create an object and assign properties to it.
 */
function NewFunction() {
    this.prop = 1;
}

new NewFunction().prop // 1