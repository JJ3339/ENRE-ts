function func1() {
    /* Empty */
}

function func2() {
    /* Empty */
}

const d = {
    a: func1,
};

d.a();

d.a = func2;

d.a();