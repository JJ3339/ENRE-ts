function func2() {
    /* Empty */
}

function func1(key) {
    arr[key]();
}

const arr = [func1, func2];

func1(1);