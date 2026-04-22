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

- 当前聚焦 GitHub Actions 构建工作流稳定性修复。
- 已定位 CI 失败根因为 Runner 默认占用系统 `/swapfile`，直接执行 `fallocate /swapfile` 会触发 `Text file busy`。
- 已将工作流 swap 策略调整为“优先复用现有 swap；仅在无可用 swap 时创建 `/mnt/immortalwrt.swap`”，避免继续改写系统级 `/swapfile`。
- 已将构建缓存改为显式 `restore/save` 双阶段，并使用 `run_id` 生成新 key，确保每次成功构建后都会写入更新后的缓存，而不是长期复用固定旧 key。

## 下一步

- 重新触发 GitHub Actions，确认缓存恢复命中最近可用项，且成功构建后生成新的缓存条目。
