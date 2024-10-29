function func1() {
    /* Empty */
}

const x = x => x();

x(func1);

function func2(a) {
    a();
}

const y = x => x + 1;

func2(y);
func2(x => x + 1);