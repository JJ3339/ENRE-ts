import { A } from "./type"

class B extends A{
    foo(){
        console.log('B')
    }
}
class C extends A{
    foo(){
    }
}
let a: A = new B()
a.foo()
A.func()
