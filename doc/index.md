URLRedirector 工作流程
==================

1. 浏览器启动，加载 URLRedirector 插件
2. 浏览器加载 background.js ，进行初始化

    backgroud.js 初始化流程

    1. 载入系统配置
    2. 从配置中读取规则列表，按照规则的处理事件和处理方法，载入到