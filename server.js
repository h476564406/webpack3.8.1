const express = require('express');
const fs = require('fs');
const Mock = require('mockjs');
const routers = require('./router.js');

const app = express();

app.get('/save', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    // 1. 保存到数据库(暂用文件存储模拟)
    // 可以根据req的参数来选择是返回固定值还是mock随机数据。
    // 2. 存储mock数据
    Object.keys(routers).forEach(key => {
        fs.open(`${key}.js`, 'w', (e, fd) => {
            if (e) {
                throw e;
            }

            const mockObj = {};
            const variableName = `${key}|1-10`;
            mockObj[variableName] = [
                {
                    'id|+1': 1,
                },
            ];
            const dataJsonString = `module.exports=${JSON.stringify(
                Mock.mock(mockObj),
            )}`;
            // 存储
            fs.write(fd, dataJsonString, 0, 'utf8', e1 => {
                if (e1) {
                    throw e1;
                }
                console.log(dataJsonString);
                fs.closeSync(fd);
            });
        });
    });

    res.send(
        `<html>
            <head>
                <meta charset="UTF-8">
            </head>
            <body>
                <div id="app">Save success</div>
            </body>
         </html>`,
    );
});

// 访问api
Object.keys(routers).forEach(key => {
    app.get(routers[key], (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        const jsonSchema = require(`./${key}.js`);
        res.send(jsonSchema);
    });
});
app.listen(3000, () => {
    console.log('app listening on port 3000!');
});
