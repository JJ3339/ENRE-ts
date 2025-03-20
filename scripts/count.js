const fs = require('fs');

// 读取 JSON 文件
const jsonData = JSON.parse(fs.readFileSync('D:\\repo\\ENRE-ts\\out\\sample2.json', 'utf-8'));
const entities = jsonData.entities;

// 统计 type 下的 typeName 数量及比例
const typeStats = {};
for (const entity of entities) {
    if (!typeStats[entity.type]) {
        typeStats[entity.type] = { total: 0, withTypeName: 0, ratio: 0 };
    }
    
    typeStats[entity.type].total++;
    if (entity.typeName !== undefined || entity.returnType !== undefined) {
        typeStats[entity.type].withTypeName++;
    }
}

// 计算比例并转换为百分数
for (const type in typeStats) {
    typeStats[type].ratio = ((typeStats[type].withTypeName / typeStats[type].total) * 100).toFixed(2) + '%';
}

// 将结果转换为 CSV 格式
let csvData = 'type,total,withTypeName,ratio\n'; // CSV 文件的头部
for (const type in typeStats) {
    const stats = typeStats[type];
    csvData += `${type},${stats.total},${stats.withTypeName},${stats.ratio}\n`; // 每一行数据
}

// 写入 CSV 文件
fs.writeFileSync('D:\\repo\\ENRE-ts\\out\\typeStats.csv', csvData, 'utf-8');

console.log('CSV 文件已保存');
