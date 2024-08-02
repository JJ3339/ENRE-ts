import { A } from "./type"

// let a = new A()
// a.foo()
class B extends A{
    foo(){
        console.log('B')
    }
}
let a: A = new B()
a.foo()
