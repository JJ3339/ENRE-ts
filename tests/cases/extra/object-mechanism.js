function foo() {
    /* Empty */
}

foo.bar = () => {
    /* Empty */
}

foo();
foo.bar();

foo = function () {
    /* Empty */
}

foo();
foo.bar();          // JSError: foo.bar is not a function.