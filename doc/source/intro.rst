URLRedirector 简介
====================

URLRedirector 是基于 WebExtension 的浏览器插件，处理 URL 重定向过程，并逐步发展到处理整个 WebRequest 过程。

URLRedirector 支持使用 WebExtension 扩展机制的浏览器，目前已支持的浏览器包括 firefox 、 chrome 、 edge ，可经过简单的修改支持更多浏览器。

URLRedirector 处理浏览器请求阶段的数据，控制 WebRequest 的过程，提供的功能包括：

1. 匹配请求的参数，进行重定向
2. 取消请求
3. 修改请求头部内容

URLRedirector 采用规则 Rule 来描述每个请求处理过程。每条 Rule 包括要处理的 WebRequest 事件、匹配参数、事件处理器、事件处理器参数等内容，分别对应于 WebRequest 的参数。

规则列表可通过在线订阅或本地定制的方式进行配置。本地定制的规则可很方便地导出为 JSON 格式的数据，并保存为文件放到云盘、github 等地方；在线订阅的规则支持自动更新，可全部或部分启用订阅的规则。

URLRedirector 提供一些常用的规则，以及和其它插件进行兼容的规则，在项目主页可找到。
