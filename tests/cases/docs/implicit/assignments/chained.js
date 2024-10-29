function func() {
    /* Empty */
}

const a = func;
const b = a;
const c = b;
c();

const x = func, y = x, z = y;
z();