function func1() {
    /* Empty */
}

function func2() {
    /* Empty */
}

function func3() {
    /* Empty */
}

const {func1: a, func02: b} = {func1, func02: func2};
a();
b();

const {func1: x, func: {func2: y, func03: z}} = {func1, func: {func2, func03}};
x();
y();
z();    // z is undefined