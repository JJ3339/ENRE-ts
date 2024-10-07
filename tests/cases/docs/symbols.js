function func1() {
    console.log('func1')
};

function func2() {
    console.log('func2')
};

const foo = {};

foo[Symbol.iterator] = function* () {
    yield func1;
    yield func2;
};

for (const func of foo) {
    func();
}

const [...bar] = foo;
bar[0]();
bar[1]();