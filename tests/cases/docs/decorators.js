function dec1(f) {
    function inner() {
        return f();
    }

    return inner;
}

function dec2(f) {
    function inner() {
        return f();
    }

    return inner;
}

class Clz {
    @dec1
    @dec2 method() {
        /* Empty */
    }
}

new Clz().method();