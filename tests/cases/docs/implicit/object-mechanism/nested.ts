function func1() {
    /* Empty */
}

function func2() {
    /* Empty */
}

const d = {
    a: {
        b: func1,
    },
};

d.a.b = func2;
d.a.b();