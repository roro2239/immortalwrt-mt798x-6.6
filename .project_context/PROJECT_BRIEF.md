## 项目概览

基于 ImmortalWrt / OpenWrt 构建树的路由器固件项目，当前任务是在保留官方 LuCI 后台的前提下，新增一套自定义 Web 后台首页。

## 技术栈

- OpenWrt / ImmortalWrt Buildroot
- uhttpd
- LuCI
- shell CGI
- HTML / CSS / JavaScript

## 目录结构

- `package/`：软件包源码与自定义功能
- `package/network/services/uhttpd/`：HTTP 服务默认实现
- `package/mtk/applications/`：平台相关应用包
- `files/`：基础文件覆盖
- `target/`：目标平台与镜像定义

## 关键模块

- `uhttpd`：Web 服务与多实例监听
- `LuCI`：官方后台与现有配置入口
- `package/mtk/applications/luci-app-openfi/`：现有自定义后台功能参考
- `package/mtk/applications/router-webui/`：自定义后台独立系统包

## 构建与运行

- 通过 OpenWrt Buildroot 编译固件
- Web 默认由 `uhttpd` 提供
- LuCI 默认入口为 `/cgi-bin/luci`

## 当前任务状态

- 当前任务聚焦两项 Web 默认行为修复：一是自定义首页点击官方后台出现 `The requested URL /cgi-bin/luci/ was not found on this server.`；二是默认后台 LAN 地址从 `192.168.6.1` 调整为 `10.0.0.1`，同时保持设备子域名解析链路不变。
- 已定位 LuCI 问题根因为 `router-webui` 将官方后台拆到 `:2239`，但包依赖未强制带入 `luci-base` 与 `luci-mod-admin-full`，导致镜像可能只有自定义首页没有 LuCI 运行时。
- 已补齐 `router-webui` 包依赖，并同步为当前 `.config` 与启用该功能的 `defconfig` 显式选中 `luci-base`、`luci-mod-admin-full`，保证官方后台随镜像一并构建。
- 已按当前需求调整自定义首页官方入口地址生成逻辑，不再显式拼接 `http`，当前输出为 `//<host>:2239/`。
- 已将默认 LAN 地址生成入口改为 `10.0.0.1`，并同步更新说明文档与相关产测脚本；`dnsmasq` / `odhcpd` 的 `lan` 域配置保持不变，因此设备子域名链路不受影响。
- 已参考 `E:\AIDE\F50-web-master` 的设备后台设计语言重做 `router-webui` 首页：新版采用顶部条、左侧导航、浅蓝标题带、白底配置卡片与双栏信息区，保留现有状态接口与 LuCI 跳转，不扩展新的配置提交链路。
- 已按最新需求将首页视觉进一步收敛：移除顶部条、侧栏、卡片与按钮的阴影效果，并删除“快速访问设备功能”等解释性小字，保留必要标题、数据和入口。
- 已移除首页顶部“刷新状态”按钮；当前页面继续通过定时请求 `/cgi-bin/router/status` 自动刷新负载、内存、温度、在线终端等参数，不触发整页刷新。
- 已移除首页标题前的装饰图标，当前仅保留“首页”文字标题，进一步简化页面头部。
- 已按最新需求彻底移除侧栏顶部品牌位区域：不再显示任何文字、品牌字样、顶部留白或分隔横线，左侧导航直接贴顶显示。
- 已移除左侧栏底部摘要区中的 `LAN 地址` 与 `在线终端` 显示，当前左侧栏仅保留导航入口，进一步收敛侧栏信息密度。
- 已新增本地预览方案：`scripts/router-webui-preview.ps1` 直接从仓库源码读取 `router-webui` 页面文件，并用 `scripts/router-webui-preview.mock.json` 提供假数据接口，无需编译即可刷新预览 UI。

## 下一步

- 校验本地预览脚本可启动，确认修改页面源码后刷新浏览器即可看到 UI 变更。
