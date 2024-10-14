class Person {
  setName() {
    return new Logger(); // 返回另一个对象
  }
}

class Logger {
  logMessage() {
    return this; // 返回 Logger 自身
  }
  end() {
  }
}

const person = new Person();
person.setName().logMessage().end();
class Simple {
  add() {
    return this; // 返回当前对象以支持链式调用
  }
  subtract() {
    return this;
  }
}
new Simple()
  .add()        // 10 + 5 = 15
  .subtract()   // 15 - 3 = 12
var Obj = {
  result: 0,
  addNumber: function (a, b) {
      this.result = a + b;
      return this;
  },
  multiplyNumber: function (a) {
      this.result = this.result * a;
      return this;
  },
}
Obj.addNumber(10, 20).multiplyNumber(10);
