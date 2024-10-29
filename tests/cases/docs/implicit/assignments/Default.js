function func1() {
    /* Empty */
}

function func2() {
    /* Empty */
}

const [a, b = func2] = [func1];
a();
b();

const {
    x, y: z = function func3() {
        /* Empty */
    }
} = {x: func1};
x();
z();