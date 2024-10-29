function bar() {
    /* Empty */
}

function foo() {
    /* Empty */
}

foo.a = bar;

const {a} = foo;

a();