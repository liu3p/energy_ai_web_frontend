const Koa = require('koa');
const cors = require('koa-cors');
const proxy = require('koa2-proxy-middleware');
const statics = require('koa-static');
const path = require('path');
const mock = require('./mock.cjs');

const app = new Koa();

app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild, RefreshToken'
    );
    ctx.set('Access-Control-Allow-Methods', '*');
    if (ctx.method === 'OPTIONS') {
        ctx.body = 200;
    } else {
        return await next();
    }
});

app.use(
    cors({
        expose: 'Authorization',
    })
);

app.use(statics(path.join(__dirname, '/assets')));

//mock参数为请求地址中前面固定的路径
app.use(mock('/api/v1/', 'data'));

// 后端服务器地址，如果请求未命中模拟数据可反向代理至后端服务器
app.use(
    proxy({
        targets: {
            '/(.*)': {
                // 设置代理的后台路由
                target: 'http://192.168.0.232:3003',
                changeOrigin: true,
                selfHandlerResponse: true,
            },
        },
    })
);

app.listen(3100);
