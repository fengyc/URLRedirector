WebRequest 介绍
=================

WebRequest 是 WebExtension 插件机制中的针对请求处理的 API ， 其核心为一系列事件，事件的详细流程见 `Mozilla WebRequest 文档 <https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest>`_。

从 WebRequest 的文档来看，WebRequest 的事件流程如下图所示：

.. image:: webRequest-flow.png

URLRedirector 的 Rule 中定义该规则的目标事件和事件的匹配参数，当匹配参数满足事件的详细参数时，则对该事件进行处理。

