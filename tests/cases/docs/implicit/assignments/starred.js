function func1() {
    /* Empty */
}

function func2() {
    /* Empty */
}

function func3() {
    /* Empty */
}

const [a, ...b] = [func1, func2, func3];
b[0]();
b[1]();