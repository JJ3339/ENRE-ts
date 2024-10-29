//// @ext mjs
function func1() {
    console.log('func1')
};

function func2() {
    console.log('func2')
};

function func3() {
    console.log('func3')
};

function func4() {
    console.log('func4')
};

const foo = [func1, func2];             // Overriden by iterator

foo[Symbol.iterator] = function* () {
    yield func2;
    yield func3;
}

foo[Symbol.asyncIterator] = async function* () {
    yield func3;
    yield func4;
}

for (const item of foo) {
    item();     // func2, func3
}

for await (const item of foo) {
    item();     // func3, func4
}