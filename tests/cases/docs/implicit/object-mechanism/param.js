function func2() {
    /* Empty */
}

function func(d, key = 'a') {
    d[key] = func2;
}

const d = {};

func(d);
d.a();