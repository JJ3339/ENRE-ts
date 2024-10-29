function func1() {
    /* Empty */
}

function func2() {
    /* Empty */
}

function func({a: [funcA]}, [, {b: funcB}], ...r) {
    funcA();
    funcB();
    r[1]();
}

func({a: [func1]}, [func1, {b: func2}], func1, func2);