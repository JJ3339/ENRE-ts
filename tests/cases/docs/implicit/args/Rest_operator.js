function func1() {
    /* Empty */
}

function func2() {
    /* Empty */
}

function func(a, ...r) {
    r[0]();
    r[1].func1();
    r[2][0]();
}

func(func1, func2, {func1}, [func2]);