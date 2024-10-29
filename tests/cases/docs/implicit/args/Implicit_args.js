function func1() {
    /* Empty */
}

function func() {
    arguments[0]();
}

func(func1);