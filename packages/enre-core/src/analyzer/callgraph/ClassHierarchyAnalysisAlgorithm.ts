import { ENREEntityClass } from "@enre-ts/data";



// // ClassNode 类节点
// export class ClassNode {
//     name: string;
//     baseClass: string | null = null;
//     children: string[] = [];

//     constructor(name: string, baseClass: string | null = null) {
//         this.name = name;
//         this.baseClass = baseClass;
//     }
// }

// ClassHierarchyAnalyzer  主要分析结构
export class ClassHierarchyAnalyzer {
    static classes: Map<string, ENREEntityClass> = new Map();

    static addClass(cls: ENREEntityClass, baseClass?: string) {
        let clsName = cls.name.codeName
        if (!this.classes.has(clsName)) {
            this.classes.set(clsName, cls);
        }
        const classNode = this.classes.get(clsName)!;
        if (baseClass){
            classNode.base = baseClass;
        }
        
        // if (baseClass) {
        //     if (!this.classes.has(baseClass)) {
        //         this.classes.set(baseClass, new ClassNode(baseClass));
        //     }
        //     this.classes.get(baseClass)!.children.push(cls);
        // }
    }

    static printHierarchy(className: string, level: number = 0) {
        const classNode = this.classes.get(className);
        if (!classNode) {
            console.log('Class not found.');
            return;
        }
        console.log(' '.repeat(level * 2) + classNode.name.codeName);
        // classNode.children.forEach(child => this.printHierarchy(child, level + 1));
    }
}


// export const CHAanalyzer = new ClassHierarchyAnalyzer();




