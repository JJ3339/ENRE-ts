const foo = {};
foo.__proto__.a = function () {
    /* Empty */
};

foo.a();

