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

## 下一步

- 校验首页结构、样式与跳转映射，确认新版自定义首页在桌面与移动端都可用。
