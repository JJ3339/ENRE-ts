import { ENREEntityClass,ENREEntityCollectionAll,ENREEntityCollectionScoping } from "@enre-ts/data";
import lookup from "../linker/lookup";
import { CallExpression, NewExpression } from "@babel/types";


class callExprNode{
    scope: ENREEntityCollectionScoping;
    expr: CallExpression | NewExpression;
    // type: string | ENREEntityClass
    constructor(scope: ENREEntityCollectionScoping, expr: CallExpression | NewExpression){
        this.scope = scope
        this.expr = expr
        // this.type = type
    }
}
// interface callGraphEdge{
//     caller: string;
//     callee: string[];

// }
// interface callgraph {
//     edge: Map<string, string[]>;
// }
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
    static callExpr: callExprNode[] = [];
    static callGraph: Map<string, Set<string>> = new Map();
    static jsonString: string;
    
    static mergeCallGraphs(graph1: Map<string, Set<string>>, graph2: Map<string, Set<string>>): Map<string, Set<string>> {
        const mergedGraph = new Map<string, Set<string>>();

        // Helper function to add entries from one graph to the merged graph
        const addEntries = (graph: Map<string, Set<string>>) => {
            graph.forEach((value, key) => {
                if (!mergedGraph.has(key)) {
                    mergedGraph.set(key, new Set(value));
                } else {
                    const existingSet = mergedGraph.get(key)!;
                    value.forEach(val => existingSet.add(val));
                }
            });
        };

        // Add entries from both graphs
        addEntries(graph1);
        addEntries(graph2);

        return mergedGraph;
    }
    static addClass(cls: ENREEntityClass, baseClass?: string) {
        let clsName = cls.name.codeName
        if (!this.classes.has(clsName)) {
            this.classes.set(clsName, cls);
        }else{
            console.log(`dumplicate class ${clsName}`)
        }
        const classNode = this.classes.get(clsName)!;
        if (baseClass){
            classNode.base = baseClass;
        }
        console.log(baseClass)
        // if (baseClass) {
        //     if (!this.classes.has(baseClass)) {
        //         this.classes.set(baseClass, new ClassNode(baseClass));
        //     }
        //     this.classes.get(baseClass)!.children.push(cls);
        // }
    }
    static addExpr(scope: ENREEntityCollectionScoping, expr: CallExpression | any){
        this.callExpr.push(new callExprNode(scope, expr))
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
    static getName(scope:ENREEntityCollectionAll | ENREEntityCollectionScoping):string {
        if (!scope.parent){
            return scope.name.codeName.split('.')[0]
        }
        return [this.getName(scope.parent), scope.name.codeName.split('.')[0]].join('.')
    }
    static processClasses(){
        // switch to lookup
        //lookup()
        for (const [key, value] of this.classes.entries()) {
            if (typeof value.base === 'string'){
                const entity = this.classes.get(value.base)
                entity?.extcls.set(key, value)
                value.base = entity
                
                this.classes.set(key, value)
            }
        }
    }
    static processExpr(){
        for (const node of this.callExpr){
            // const from = node.scope.name
            // const from = this.getName(node.scope)
            const from = node.scope.getQualifiedName()
            let to = []
            switch(node.expr.callee.type){
                case 'MemberExpression':{
                    const objName = Reflect.get(node.expr.callee.object, 'name')
                    const propName = Reflect.get(node.expr.callee.property, 'name')
                    const obj = lookup(
                        {role: 'value', 
                        identifier: objName, 
                        at: node.scope,
                        }, true) as ENREEntityCollectionScoping;
                    //TODO: the scope of prop shouldn't be the same with obj, the static and instance
                    if (!obj){
                        break;
                    }
                    let scope = obj
                    if ('clsTypeName' in obj && obj.clsTypeName){
                        scope = lookup(
                            {role: 'value', 
                            identifier: obj.clsTypeName, 
                            at: scope,
                            }, true) as ENREEntityCollectionScoping;
     
                    }
                    const prop = lookup(
                        {role: 'value', 
                        identifier: propName, 
                        at: scope,
                        }, true) as ENREEntityCollectionAll;

                    if (obj.type === 'variable'){
                        const clsTypeName = obj.clsTypeName
                        if (clsTypeName){
                            const clsType = this.classes.get(clsTypeName)
                            if (!clsType){
                                break;
                            }
                            const extcls = clsType.extcls
                            let clsList: ENREEntityClass[] = [clsType]
                            while(clsList.length > 0){
                                let type = clsList.shift() as ENREEntityClass
                                let temp = lookup(
                                    {role: 'value', 
                                    identifier: propName, 
                                    at: type,
                                    }, true) as ENREEntityCollectionAll;
                                //TODO: if lookup succeed, push
                                // to.push(`${type.name}.${prop.name}()`)
                                let qualifiedName = temp.getQualifiedName()
                                to.push(`${qualifiedName}`)
                                for (const [key, value] of type.extcls.entries()){
                                    clsList.push(value)
                                }
                            }
                        }
                    }else{
                        // to.push(`${obj.name}.${prop.name}()`)
                        // to.push(`${this.getName(prop)}()`)
                        //to.push(`${prop.getQualifiedName()}`)
                    }
                    break;
                }
                // case 'Identifier':{
                //     const id = lookup(
                //         {role: 'value', 
                //         identifier: node.expr.callee.name, 
                //         at: node.scope,
                //         }, true) as ENREEntityCollectionScoping;
                //     // 
                //     if (id.type === 'class'){
                //         // to.push(`${id.name}.constructor()`)
                //         // TODO: lookup?
                //         // to.push(`${this.getName(id)}.constructor()`)
                //         to.push(`${id.getQualifiedName()}`)
                //     }else{
                //         //do noting
                //     }
                //     break;
                // }
                
            }
            if (!this.callGraph.has(from)) {
                this.callGraph.set(from, new Set());
            }
            // this.callGraph.get(from.codeName)!.add;
            to.forEach(edge => this.callGraph.get(from)?.add(edge)) 
        }
        
    }
    static dumpToJson(){
        // 创建一个普通对象来存储转换后的数据
        const obj: { [key: string]: string[] } = {};

        this.callGraph.forEach((value, key) => {
            obj[key] = Array.from(value);
        });
        // 使用 2 个空格缩进来格式化 JSON 字符串
        // const jsonString = JSON.stringify(obj, null, 2); 
        this.jsonString = JSON.stringify(obj, null, '\t');
        return this.jsonString
        // return jsonString
        // fs.writeFile('out/callGraph.json', jsonString, (err) => {
        //     if (err) {
        //         console.error('Error writing file:', err);
        //     } else {
        //         console.log('File has been written');
        //     }
        // });
    }
}


// export const CHAanalyzer = new ClassHierarchyAnalyzer();




