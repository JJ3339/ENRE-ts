function returnFunc() {
    /* Empty */
}

function func() {
    const a = returnFunc;
    return a;
}

const a = func;
a()(); 