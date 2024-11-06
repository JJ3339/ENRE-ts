

import { ENREEntityClass, ENREEntityCollectionAll, ENREEntityCollectionScoping } from "@enre-ts/data";


export class PointerAnalyzer{
    static classes: Map<string, ENREEntityClass> = new Map();
    
    static callGraph: Map<string, Set<string>> = new Map();
    static jsonString: string;
    
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
    static add(from:any, to:any, location:any){
        if (!this.callGraph.has(from)) {
            this.callGraph.set(from, new Set());
          }
        this.callGraph.get(from)?.add(to+'@'+location.start.line+':'+location.start.column);
        // 检查 from 对应的集合中是否已包含 to
        // const fromSet = this.callGraph.get(from);
        // if (fromSet?.has(to)) {
        //     console.log(`'${from}' already has a connection to '${to}'`);
        // } else {
        //     // 如果没有，添加 to 到集合中
        //     fromSet?.add(to);
        // }
    }

}