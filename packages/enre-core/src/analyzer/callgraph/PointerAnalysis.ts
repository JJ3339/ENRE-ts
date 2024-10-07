

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

}