# cloudview.framework-next

Vue3版本脚手架，使用typescript语言

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn dev
```

### Compiles and minifies for production
```
yarn build
```

### preview
```
yarn preview
```

### Lints and fixes files
```
yarn lint
```

### 目录说明
**mock**: 模拟后台

**public**: 静态文件目录，包括全局参数配置文件config.js

**src**: 源码目录

    assets: 资源文件目录
    
    common: 存放公共组件、公共样式、静态数据、工具方法等的目录
    
    locale: 国际化文件目录
    
    modules: 业务模块目录

    style.css: 全局基础样式
    
    main.ts: 入口文件，用于执行框架的初始化，引入依赖包，依赖样式，实例化Vue等操作
    
    app.vue: 主page页面，所有的组件都会挂到它上面
    
    router.ts: 全局路由配置，包括路由地址，路由守卫等

### 框架已有能力
1、框架已经以按需引入的方式引入公共组件库（cloudview.ui-next），请看对应库的README文档

2、框架支持国际化，需要业务侧在locale文件夹下对应的国际化文件中填入国际化内容，并在Vue组件中用以下方式调用，其中参数是国际化的key。同时，国际化的内容应该按照模块来划分。其中http请求错误的国际化统一放在error模块中。
```
import {useLocale} from 'cloudview.ui-next';
const {t} = useLocale();
```
```
t('fw.common.timeout')
```

3、框架的http服务支持刷新token，但是需要业务侧补全刷新token的逻辑，需要修改几处代码：

a. 修改 `src/common/auth.service.ts` 中的 `refreshToken` 中的方法以及 `public/config.js`中的 `window.CONFIG.API_URL` 变量的值，使其能够从业务系统中通过refreshToken获得新的token

b. 如果业务的token字段的名称特殊，或者对token的存储位置需要特殊处理，还需要修改 `src/common/tools.ts` 文件中的 `TokenUtils` 类中的 `setLocalToken` 等方法

c. 如果通用的刷新token的流程不能满足业务需求，可以直接修改或重写 `src/common/http.ts` 中的 refreshToken方法

d. 如果业务有明确定义登录已过期状态的错误码，请将 `src/common/http.ts` 中带有 `// todo: 如果业务有明确的错误码，请根据业务错误码决定是否刷新token` 注释的判断逻辑修改为请求返回的错误码是否为业务系统对应的错误码

e. 刷新token失败后重定向到登录页，需要修改 `src/common/auth.service.ts` 的 `redirectLogin` 方法中的重定向URL

4、一些可能根据部署环境不同而需要动态设置的变量，应该放在public/config.js中，方便在部署时进行设置，比如用户中心的URL，业务侧后台API的base路径等

5、common/utils.ts包含了一些常用的工具方法，譬如：下载文件，校验字符串（包括手机号，邮箱，用户名，密码等常见字符串）规则，读文件，判断文件类型，判断文件大小等方法。业务侧可以根据需要自行扩充其中的工具方法。如果觉得有缺失常用的方法，可以提出需求

6、在router.ts中设置了路由相关的内容，包括页面路由配置，路由守卫等

### 通过svg图标文件生成vue组件
UI设计的图标导出成svg文件后，可以通过执行 `yarn gen-icon` 命令将svg文件转换成对应的vue组件，然后通过 `cv-icon`组件使用图标组件，并可以轻松的修改其大小，颜色等属性。

**使用事项：**

1、默认的图标svg文件存放目录为 `src/assets/icons/`，如果需要放在其他目录，请同步修改 `build/paths.ts` 文件中的 `pathSvg` 变量对应的目录。

2、默认的导出图标组件的目录为 `src/icons/`，如果需要配置导出目录，请修改 `build/paths.ts` 文件中的 `pathSrc` 变量对应的目录。

3、由于UI导出的图标svg文件可能不规范，所以在生成图标组件时可能会有以下两种情况
：

a. 可以正常生成组件，但是使用时报错 `Tags with side effect (<script> and <style>) are ignored in client component templates.` ，这是因为svg文件中含有style标签，所以生成的组件中也含有style标签，导致vue解析组件模板失败。此时需要UI导出图标svg时，注意不能导出含有style标签的图标

b. 可以正常生成组件，但是无法改变图标的颜色。可能是因为UI在设计时，没有将图标的颜色设为模板色，而是设置了固定颜色，导致生成的组件也是固定颜色，从而无法修改颜色

4、如果需要修改生成组件代码的逻辑，可以修改 `build/generate.ts` 中 `recursionInsertFill` 方法的实现

5、如果要修改生成的Icon组件名的前缀，可以修改 `build/generate.ts` 中 `prefix` 变量的值

### mock使用说明

mock是后端接口未提供时，前端测试使用，根据接口文档建立测试接口。

**使用方法：**

##### 1.配置app.cjs。
```javascript
// mock第一个参数是api路径的固定前缀，第二个参数是访问的文件夹的名字
// 因为可能会有多个后台服务，所以可以多次执行app.use()
app.use(mock('/auth/api/v1/', 'uc-data'));

// 后端服务器地址，如果请求未命中模拟数据可反向代理至后端服务器
app.use(
    proxy({
        targets: {
            '/(.*)': {
                target: 'http://192.168.0.232:3003',
                changeOrigin: true,
                selfHandlerResponse: true,
            },
        },
    })
);
```

##### 2.书写模拟接口。

在data目录中新建json文件，命名格式为请求路径以'.'分隔，最后加上请求的方式名，如：

GET http://xxx.com/api/v1/test 对应接口文件为 test.get.json

POST http://xxx.com/api/v1/item/user  对应接口文件为 item.user.post.json

对restAPI路由中参数的支持，如：

GET http://xxx.com/api/v1/test/1234  对应接口文件为 test.#.get.json

POST http://xxx.com/api/v1/item/1234/user/123  对应接口文件为 item.#.user.#.post.json


##### 3.接口文件内容为mockjs格式

mockjs语法参考：http://mockjs.com/

```josn
{
    "status": 200, // HTTP状态码
    "data|1-10": [ // 根据api文档自行确定结构
        {
            "id|+1": 1,
            "name": "@cname()",
            "date": "@date()"
        }
    ]
}
``` 

##### 4.使用yarn mock启动服务，访问端口默认为3100，可根据情况自行修改。


### 补充内容
1、前端Token刷新的方案

a. 前端会将所有请求的返回进行拦截，判断请求返回的http状态码是否是401或者业务指定的错误码是否是未登录

b. 如果没有错误码，则将请求结果正常返回；如果错误码显示token已过期，则前端发送刷新Token的请求，此时，所有前端的请求都被拦截，等待后台返回新的token。待后台返回新token之后，再将之前拦截的请求一一发往后端，如果refreshToken也过期的话，则自动重定向到登录页

2、后台API返回错误的提示

a. 在国际化文件中，将后台错误码作为key，对应的错误提示信息作为value进行填写，如果后台返回的错误信息中带有参数数组，则在国际化内容中使用{Number}的形式填充，其中Number对应参数的索引

b. 在判断请求应答失败之后，需要调用this.httpException(res, msg), 其中res是response的消息体，msg是对这个错误的补充描述 
