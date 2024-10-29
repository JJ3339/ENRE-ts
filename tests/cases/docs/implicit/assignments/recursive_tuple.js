function func1() {
    /* Empty */
}

function func2() {
    /* Empty */
}

function func3() {
    /* Empty */
}

const [a, b] = [func1, func2];
a();
b();

const [x, [y, z]] = [func1, [func2, func3]];
x();
y();
z();