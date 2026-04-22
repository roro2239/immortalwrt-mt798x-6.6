# 更新日志

## 2026-04-22 自定义后台首版接入

### 目标

- 新增独立自定义后台首页
- 保留官方 LuCI 后台作为高级管理入口
- 将自定义实现与上游 LuCI / uhttpd 源码尽量解耦

### 主要变更

- 新增独立系统包 `package/mtk/applications/router-webui/`
- 新增自定义首页静态资源：
  - `custom-index.html`
  - `app.css`
  - `app.js`
- 新增状态接口 `status.cgi`，输出主机名、LAN/WAN、SSID、终端数、内存、温度等首页所需数据
- 新增 `official-index.html`，用于官方后台实例目录
- 新增 `99-router-webui` 启动配置脚本

### 入口调整

- 停用默认 `uhttpd.main`
- 新增独立 `uhttpd.custom` 实例承接自定义后台：
  - HTTP: `80`
  - HTTPS: `443`
- 新增独立 `uhttpd.official` 实例承接官方 LuCI：
  - HTTP: `2239`
- 官方 LuCI 入口保持 `/cgi-bin/luci`

### 解耦策略

- 不修改 LuCI 控制器、菜单、主题、模板源码
- 不修改上游 `uhttpd` 包源码
- 不再通过 `target/linux/mediatek/Makefile` 注入默认包
- 改为在设备 `defconfig` 中显式启用 `CONFIG_PACKAGE_router-webui=y`

### 首页信息架构

- 设备总控台
- 网络概览
- Wi-Fi 总览
- 接入设备
- 系统服务
- 快捷入口

### 已处理问题

- 移除首页中面向开发者的说明型文案
- 修复首页快捷入口仍指向 `80` 端口 LuCI 的问题
- 修复页面重复 `id` 冲突
- 修复快捷入口卡片 HTML 闭合结构问题

### 影响范围

- `defconfig/*.config`
- `package/mtk/applications/router-webui/*`
- `.project_context/PROJECT_BRIEF.md`

### 当前状态

- 代码已完成落地
- 尚未执行完整固件编译与真机联调
- 如需继续扩展，可在独立包内继续补登录态复用与配置写回能力
