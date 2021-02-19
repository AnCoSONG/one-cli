# 接口设计

## 使用yaml header还是使用交互式/参数式的提交方式

### Yaml Header
使用Yaml Header可以静态的设置很多参数。需要借用`meta-marked`或`front-matter`包来ß解析和提取`yaml header`和`markdown`

### 交互式
比较灵活

### 参数式
一站式提交

### 综合考虑

目前来看，必须要使用yaml header了，每次手动填写真的非常麻烦，而且临时填的内容不一定准确，想修改暂时没有接口

## To-Do

- [ ] YAML HEADER
- [ ] fix Markdown path error