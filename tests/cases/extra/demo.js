function foo() {
  return () => {
      /* Empty */
  }
}
const bar = foo();
bar();
