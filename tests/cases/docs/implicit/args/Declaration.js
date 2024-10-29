function foo(a) {
    a()
}

foo(function () {
    /* Empty */
})

foo(() => {
    /* Empty */
})