function func1() {
    /* Empty */
}

function func2() {
    /* Empty */
}

const d = {
    "1": func1,
    1: func2,           // Numeric key is firstly evaluated to string, thus override the previous line
};

d[1]();                 // func2