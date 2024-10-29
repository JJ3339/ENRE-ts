function func1() {
    /* Empty */
}

const [a, b, c] = [func1, function func2() {
    /* Empty */
}, class {
    method() {
        /* Empty */
    }
}]

a();
b();
new c().method();