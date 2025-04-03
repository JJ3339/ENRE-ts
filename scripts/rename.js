const fs = require('fs');
const path = require('path');

/**
 * 递归遍历文件夹，重命名 .bundle 文件为 .js
 * @param {string} dirPath - 目标文件夹路径
 */
function renameBundleFilesRecursively(dirPath) {
    fs.readdir(dirPath, { withFileTypes: true }, (err, entries) => {
        if (err) {
            console.error(`无法读取文件夹: ${dirPath}`, err);
            return;
        }

        entries.forEach(entry => {
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                // 递归遍历子目录
                renameBundleFilesRecursively(fullPath);
            } else if (entry.isFile() && path.extname(entry.name) === '.bundle') {
                // 计算新文件名
                const newFilePath = path.join(dirPath, path.basename(entry.name, '.bundle') + '.js');

                // 重命名文件
                fs.rename(fullPath, newFilePath, err => {
                    if (err) {
                        console.error(`重命名失败: ${fullPath} -> ${newFilePath}`, err);
                    } else {
                        console.log(`重命名成功: ${fullPath} -> ${newFilePath}`);
                    }
                });
            }
        });
    });
}

// 设置目标目录（请修改为你的目标文件夹）
const targetFolder = 'F:\\Documents\\WeChat Files\\wxid_ax2xaae1rcrc22\\FileStorage\\File\\2025-03\\rn'; // 例如：'C:/Users/yourname/Documents'

renameBundleFilesRecursively(targetFolder);
