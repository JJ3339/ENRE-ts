// function foo() {
//   return () => {
//       /* Empty */
//   }
// }
// const bar = foo();
// bar();
function func(a) {
  a()
}

function func2() {
  return func3
}

function func3() {
  /* Empty */
}

func(func2());