import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

// ClassNode 表示一个类节点
class ClassNode {
    name: string;
    baseClass: string | null = null;
    children: string[] = [];

    constructor(name: string, baseClass: string | null = null) {
        this.name = name;
        this.baseClass = baseClass;
    }
}

// ClassHierarchyAnalyzer 负责构建和分析类层次结构
class ClassHierarchyAnalyzer {
    private classes: Map<string, ClassNode> = new Map();

    addClass(name: string, baseClass: string | null) {
        if (!this.classes.has(name)) {
            this.classes.set(name, new ClassNode(name, baseClass));
        }
        const classNode = this.classes.get(name)!;
        classNode.baseClass = baseClass;
        if (baseClass) {
            if (!this.classes.has(baseClass)) {
                this.classes.set(baseClass, new ClassNode(baseClass));
            }
            this.classes.get(baseClass)!.children.push(name);
        }
    }

    printHierarchy(className: string, level: number = 0) {
        const classNode = this.classes.get(className);
        if (!classNode) {
            console.log('Class not found.');
            return;
        }
        console.log(' '.repeat(level * 2) + classNode.name);
        classNode.children.forEach(child => this.printHierarchy(child, level + 1));
    }
}

// 解析 TypeScript 代码并构建类层次结构
const code = `
class Animal {
  speak() {
    console.log('Animal speaks');
  }
}

class Dog extends Animal {
  speak() {
    console.log('Dog barks');
  }
}

class Cat extends Animal {
  speak() {
    console.log('Cat meows');
  }
}
`;

const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript']
});

const analyzer = new ClassHierarchyAnalyzer();

traverse(ast, {
    ClassDeclaration(path) {
        const className = path.node.id.name;
        const baseClassName = path.node.superClass ? (path.node.superClass as t.Identifier).name : null;
        analyzer.addClass(className, baseClassName);
    }
});

console.log('Class Hierarchy:');
analyzer.printHierarchy('Animal');
