# cloudview.ui-next-icon

### 安装依赖
```shell
yarn install
```

### 打包命令
```shell
yarn build
```

### 启动playground预览效果
```shell
yarn dev
```

### 上传npm包
```shell
npm publish
```

### 操作步骤
* 将svg图标文件放入`packages/svg`目录下
* 在项目根目录打开终端，执行`yarn build`命令
* build命令完成后， 执行`yarn dev`，即可在浏览器预览图标效果
* 预览没问题之后，修改版本号，执行`npm publish`将包上传

### 补充说明
* 所有svg图标文件应放在`packages/svg`目录下
* 生成的.vue文件会存放在`packages/src`目录下，但生成.vue文件只是一个中间态，所以不需要提交至代码库
* 启动playground应在执行build之后，否则playground无法引入打包完成后的图标库
* svg文件不应包含`<?xml /> <style /> <script />` 标签，否则会解析失败
* 图标如果是单色图标，则不应在svg内的元素中存在fill属性，在生成.vue文件时，会根据是否有fill属性来判断改图标是否为单色图标。如果是多色图标，请确保每个svg内的元素都有fill属性以保证颜色不会被代码修改。
