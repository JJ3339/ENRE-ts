function func1() {
    function dec(f) {
        return f;
    }

    return dec;
}

class Clz {
    @func1() method() {
        /* Empty */
    }
}