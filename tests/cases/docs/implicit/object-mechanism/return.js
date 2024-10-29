function func2() {
    /* Empty */
}

function func1() {
    const d = {a: func2}
    return d;
}

const b = func1();
b.a();