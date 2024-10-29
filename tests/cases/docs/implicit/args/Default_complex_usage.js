function func1() {
    /* Empty */
}

function func2() {
    /* Empty */
}

function func({a: [funcA] = [func1]}, [, {b: funcB} = {b: func2}], c = [func1]) {
    funcA();
    funcB();
    c[0]();
}

func({b: [func2]}, [func2]);