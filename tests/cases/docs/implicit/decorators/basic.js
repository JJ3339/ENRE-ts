function dec1(f, c) {                   // It is not an error for not providing two parameters
    f();
    return f;
}

function dec2(f, c) {
    return f;
}

let a = dec1;
a = dec2;

class Clz {
    @dec1
    @dec2
    @a method() {                       // Note the decorator execution order: a -> dec2 -> dec1 (-> method)
        /* Empty */
    }
}