import { ClassHierarchyAnalyzer } from "./ClassHierarchyAnalysisAlgorithm";
import lookup from "../linker/lookup";
import { ENREEntityClass, ENREEntityCollectionAll, ENREEntityCollectionScoping } from "@enre-ts/data";


export class RapidTypeAnalyzer extends ClassHierarchyAnalyzer{
    // static instance: Map<string, ENREEntityClass> = new Map();
    static callGraph: Map<string, Set<string>> = new Map();
    static newClass: ENREEntityCollectionScoping[] = [];
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
                                for (const [key, value] of type.extcls.entries()){
                                    clsList.push(value)
                                }
                                if (!this.newClass.includes(type)){
                                    continue;
                                }
                                //TODO: if lookup succeed, push
                                // to.push(`${type.name}.${prop.name}()`)
                                let qualifiedName = temp.getQualifiedName()
                                to.push(`${qualifiedName}`)
                                
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