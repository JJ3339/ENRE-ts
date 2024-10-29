function func3() {
    /* Empty */
}

function func2(a = func3) {
    a()
}

function func1(a, b = func2) {
    a(b)
}

const a = func2, b = func3;

func1(a, b)