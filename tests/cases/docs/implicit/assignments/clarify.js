function func1() {
    /* Empty */
};

function func2() {
    /* Empty */
};

function func3() {
    /* Empty */
};

function func4() {
    /* Empty */
};

const foo = [func1, func2];
foo['prop'] = func3;
foo[2] = func4;
// `foo` becomes [func1, func2, func4, 'prop': func3]
const [foo0, ...foo1] = foo;
foo0();                 // func1
foo1[0]();              // func2, the index was reset to 0
foo1['prop']();         // Invalid
foo1[1]();              // func4

const bar = {0: func1, 1: func2};
bar['prop'] = func3;
// `bar` becomes {0: func1, 1: func2, 'prop': func3}
const {0: bar0, ...bar1} = bar;
bar0();                 // func1
bar1[0]();              // Invalid, in object it is not index but string key 0 -> '0', thus not reset to 0
bar1[1]();              // func2
bar1['prop']();         // func3