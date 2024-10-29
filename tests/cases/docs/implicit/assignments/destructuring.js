function func1() {
    /* Empty */
}

function func2() {
    /* Empty */
}

function func3() {
    /* Empty */
}

const {func1: a, ...func} = {func1, func2, func3};
a();
func.func2();
func.func3();

const {func1: x, func: {func2: y, ...z}} = {func1, func: {func2, func3}};
x();
y();
z.func3();