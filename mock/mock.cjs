const Mock = require('mockjs'),
    path = require('path'),
    fs = require('fs').promises;

function to(promise) {
    return promise.then(res => res).catch(err => false);
}

async function parseMockFile(ctx, data) {
    const mockData = Mock.mock(JSON.parse(data));
    ctx.status = mockData.status;
    ctx.body = JSON.stringify(mockData.data);
}

module.exports = (basePath = '', dataFolder = 'data', exceptList = []) => {
    return async (ctx, next) => {
        if (!new RegExp('^' + basePath + '.*').test(ctx.path)) {
            return await next();
        }
        const dataPath = path.join(__dirname, `./${dataFolder}/`);
        const basePathRegExp = new RegExp('^' + basePath);
        const routePath = ctx.path.replace(basePathRegExp, '');
        if (exceptList.includes(routePath)) {
            return await next();
        }
        const paths = routePath.split('/').filter(item => item !== '');
        paths.push(ctx.request.method.toLowerCase());
        const fileName = paths.join('.') + '.json';
        const filePath = dataPath + fileName;
        const data = await to(fs.readFile(filePath));
        if (data) {
            parseMockFile(ctx, data);
        } else {
            const files = await to(fs.readdir(dataPath));
            if (files) {
                const matchFiles = files.filter(item => {
                    return item.includes('#');
                });
                let fileMatchName;
                matchFiles.some(f => {
                    if (new RegExp(f.replace(/#/g, '[^/]*').replace(/\./g, '/')).test(fileName.replace(/\./g, '/'))) {
                        fileMatchName = f;
                        return true;
                    }
                    return false;
                });
                if (fileMatchName) {
                    const d = await to(fs.readFile(dataPath + fileMatchName, 'utf8'));
                    parseMockFile(ctx, d);
                } else {
                    return await next();
                }
            } else {
                return await next();
            }
        }
    };
};
