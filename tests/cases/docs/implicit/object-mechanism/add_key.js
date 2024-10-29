function func() {
    /* Empty */
}

const d = {};

d["b"] = func;
d["b"]();
d.b();