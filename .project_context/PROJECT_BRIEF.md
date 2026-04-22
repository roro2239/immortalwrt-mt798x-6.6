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

- 已确认采用“双实例后台”方案。
- 已创建独立自定义后台包骨架。
- 已补 `uhttpd` 默认配置脚本，准备将自定义后台固定到 `80/443`，官方 LuCI 固定到 `2239`。
- 已将首页首屏改为产品化表达，移除实现说明型文案。
- 已接入首页真实状态接口，输出网络、Wi-Fi 与系统状态 JSON。
- 已将 `router-webui` 的集成点从平台默认包层移回设备配置层。
- 首页模块已扩展为网络概览、无线网络、接入设备、系统服务、快捷入口。
- Web 入口已改为独立 `custom` / `official` 双实例，不再继续复用 `uhttpd.main` 作为主实现。
- 已确认测试设备为 `Cudy TR3000 v1 256MB`，对应设备定义为 `cudy_tr3000-v1-256mb`。
- 已新增设备专用配置 `defconfig/cudy-tr3000-v1-256mb.config`。
- 设备专用配置已从通用 `mt7981-ax3000` 多机型配置收口为 `TR3000 256MB` 单设备配置，并保留 `router-webui`。
- 已新增 GitHub Actions 测试构建工作流，使用当前仓库源码直接编译，不再额外指定源码地址。
- 构建工作流已固定使用 `defconfig/cudy-tr3000-v1-256mb.config`，移除固件名、系统名、WiFi 名称、后台地址和额外安装包定制步骤。
- 构建工作流已加入 `actions: read` 权限与缓存恢复逻辑，准备规避 `Resource not accessible by integration` 报错并缩短重复构建时间。
- 构建工作流已补 Runner 环境清理、磁盘/内存观测、`4G` swap 与保守并行度，优先缓解 GitHub Actions 存储与内存不足问题。

## 下一步

- 补提 `defconfig/cudy-tr3000-v1-256mb.config`，否则远端工作流仍无法复制目标配置文件。
