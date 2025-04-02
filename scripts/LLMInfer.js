const https = require("https");
const fs = require("fs").promises; // 使用 fs.promises 替代同步方式

// 配置 Ollama API
const OLLAMA_API_URL = "http://127.0.0.1:11434/api/generate";
const MODEL_NAME = "deepseek-r1:1.5b"; // 可选: "gemma3:4b ", "codellama:latest" , "deepseek-r1:1.5b"

// 代码输入
const codeSnippet = `
function createAdder(base){
    return (x) => base + x;
}
function retAssign(ret){
    return ret;
}
const adder = createAdder(10);
adder("20")
retAssign('10')
`;

// 生成提示词
const prompt = `
你是一个代码分析专家，请对以下代码进行类型推断，并按照 JSON 格式返回结果，无需输出思考过程：

代码：
\`\`\`
${codeSnippet}
\`\`\`

请将回答严格按照JSON格式，禁止格式控制符，示例格式如下：

**示例输出：**
{
  "identifier": [
    { "name": "add", "type": "(number | string, number | string) => number | string" },
    { "name": "add.a", "type": "number | string" },
    { "name": "add.b", "type": "number | string" },
    { "name": "name", "type": "string" },
    { "name": "age", "type": "number" }
  ]
}
`;

async function analyzeCode() {
  try {
    // 使用 https 发送 POST 请求到 Ollama API
    const data = JSON.stringify({
      model: MODEL_NAME,
      prompt: prompt,
      stream: false // 后续确定是否开启 stream 输出
    });

    const options = {
      hostname: '127.0.0.1',
      port: 11434,
      path: '/api/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      }
    };

    const req = https.request(options, (res) => {
      let resultText = '';

      res.on('data', (chunk) => {
        resultText += chunk;
      });

      res.on('end', () => {
        try {
          // 解析返回的 JSON
          let temp = resultText.replace(/<think>[\s\S]*<\/think>/, '');
          let temp2 = temp.replace(/^```json\n|```$/g, '');
          const jsonResult = JSON.parse(temp2.trim());

          // 将结果写入到文件
          const outputFilePath = `./${MODEL_NAME.replace(":", "_")}_type_inference_result.json`;
          fs.writeFile(outputFilePath, JSON.stringify(jsonResult, null, 2));

          console.log(`类型推断结果已成功存储到文件：${outputFilePath}`);
        } catch (parseError) {
          // 如果解析失败，则输出原始文本内容
          console.error("AI 返回的内容无法解析为 JSON:", resultText);
        }
      });
    });

    req.on('error', (error) => {
      console.error("请求发生错误:", error.message);
    });

    // 发送请求数据
    req.write(data);
    req.end();
  } catch (error) {
    console.error("请求发生错误:", error.message);
  }
}

// 运行脚本
analyzeCode();
