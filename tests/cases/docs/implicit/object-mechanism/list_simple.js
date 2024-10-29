function func1() {
    /* Empty */
}

function func2() {
    /* Empty */
}

function func3() {
    /* Empty */
}

const a = [func1, func2];

a[0]();
a[1]();

const b = [];
b[0] = func3;

b[0]();