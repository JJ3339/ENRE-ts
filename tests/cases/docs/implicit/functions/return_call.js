function returnFunc() {
    function nestedReturnFunc() {
        /* Empty */
    }

    return nestedReturnFunc;
}

function func() {
    return returnFunc;
}

func()()();