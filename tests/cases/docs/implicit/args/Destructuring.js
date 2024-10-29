function func1() {
    /* Empty */
}

function func2() {
    /* Empty */
}

function func([a, b], {func1: c, func2: d}) {
    a();
    b();
    c();
    d();
}

func([func1, func2], {func1, func2});