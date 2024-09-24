function paramFunc() {
    /* Empty */
}

function func(a) {
    a()
}

const b = paramFunc;
func(b);