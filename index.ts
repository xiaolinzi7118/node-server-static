import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import * as fs from 'fs';
import * as p from 'path';
import * as url from 'url';

const server = http.createServer();
const publicDir = p.resolve(__dirname, 'public');
const cacheAge = 3600 * 24 * 365;
server.on('request', (request: IncomingMessage, response: ServerResponse) => {
    const { method, url: path, headers } = request;
    const { pathname, search } = url.parse(path);   // pathname 只包含 ？之前的路径
    // let Suffix = pathname.split('.').pop().toLowerCase();  // 文件后缀名 html css js 等
    // if(Suffix === '/'){
    //   Suffix = 'html'
    // }
    // response.setHeader('Content-Type', `text/${Suffix}; charset=utf-8`);

    if (method !== 'GET') {
        response.statusCode = 200;
        response.setHeader('Content-Type', `text/html; charset=utf-8`);
        response.end('不能使用GET之外的方式来请求！');
    }
    let fileName = pathname.substr(1);  // 获取 文件名   index.html  / style.css
    if (fileName === '') {
        fileName = 'index.html';
    }
    fs.readFile(p.resolve(publicDir, fileName), (error, data) => {
        if (error) {
            console.log(error);
            if (error.errno === -4058) {
                response.statusCode = 404;
                fs.readFile(p.resolve(publicDir, '404.html'), (error, data) => {
                    response.end(data);
                });
            } else {
                response.statusCode = 500;
                response.end('服务器繁忙，请稍后重试');
            }
        } else {
            // 添加缓存
            response.setHeader('Cache-Control', `public, max-age=${cacheAge}`);
            response.end(data);
        }
    });
});

server.listen(8888, () => {
    console.log('8888端口已开启');
});