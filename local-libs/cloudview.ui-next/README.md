## 快速开始

Vue3版本SFERE前端组件库。
文档地址：[http://cloudview-ui-next.ci.sfere.local/](http://cloudview-ui-next.ci.sfere.local/)

### 安装

1. 安装yrm，切换为SFERE企业仓库。

```shell
yrm add sfere http://repo.sfere.local/repository/npm-group/

yrm use sfere
```

2. 安装组件库

```shell
pnpm add cloudview.ui-next
```

### 用法

组件库支持按需引入和完整引入两种方式。

:::tip
使用按需引入的方式最终的打包后会通过TreeShaking移除未使用的组件，大幅减少打包后的体积，强烈建议使用按需安装模式。
:::

#### 按需引入

按需引入通过安装vite插件来支持自动导入，不需要手动引入组件及样式。

1. 安装 unplugin-vue-components 和 unplugin-auto-import 两款插件。

```shell
pnpm add unplugin-vue-components
pnpm add unplugin-auto-import
```

2. 配置vite

```typescript
// vite.config.ts
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {CloudViewResolver} from "cloudview.ui-next/utils";

export default {
    plugins: [
        // ...
        AutoImport({
            resolvers: [CloudViewResolver()],
            eslintrc: {
                enabled: true,
                filepath: "./.eslintrc-auto-import.json",
                globalsPropValue: true,
            },
        }),
        Components({
            resolvers: [CloudViewResolver()],
        }),
    ],
}
```

3. 配置eslint

```javascript
module.exports = {
    // ...
    extends: [
        // ....
        './.eslintrc-auto-import.json',
    ]
}
```

4. 在需要的位置直接使用组件

```vue

<template>
    <cv-button>I am ElButton</cv-button>
</template>
<script lang="ts" setup>
// 注意不要书写下面这行来手动导入
// import {CvMessage} from 'cloudview.ui-next';

CvMessage('Hello World')
</script>
```

:::tip
类似CvMessage这种直接导入使用的组件，一定不要手动导入，否则不会自动引入组件样式
:::

#### 完整引入

如果你对打包后的文件大小不是很在乎，那么使用完整导入会更方便。

```typescript
// main.ts
import {createApp} from 'vue';
import CloudviewUI from 'cloudview.ui-next';
import 'cloudview.ui-next/theme-chalk/index.css';
import App from './App.vue';

const app = createApp(App);

app.use(CloudviewUI);
app.mount('#app');
```

### 配置

在引入组件库时，可以传入一个包含 size 和 zIndex 属性的全局配置对象。 size 用于设置表单组件的默认尺寸，zIndex
用于设置弹出组件的层级，zIndex 的默认值为 2000。

#### 按需引入方式的配置

可以在顶级组件app.vue中进行配置

```vue

<template>
    <cv-config-provider :size="config.size" :zIndex="config.zIndex">
        <app/>
    </cv-config-provider>
</template>

<script lang="ts" setup>
const config = {
    zIndex: 3000,
    size: 'small',
};
</script>
```

#### 全局引入方式的配置

```typescript
// main.ts
import {createApp} from 'vue';
import CloudviewUI from 'cloudview.ui-next';
import App from './App.vue';

const app = createApp(App)
app.use(CloudviewUI, {size: 'small', zIndex: 3000})
```

#### 组件文档书写格式

组件文档书写必须严格遵照以下格式，以"-"填充空格。

```markdown
## 组件Tag 组件名

组件Demo或介绍等

### 组件Tag Attributes

|Attribute| Description | Type | Accepted Values | Default |
|---|---|---|---|---|
|...|...|...|...|

### 组件Tag Events

|Event Name| Description | Paramaters |
|---|---|---|---|
|...|...|...|
```
