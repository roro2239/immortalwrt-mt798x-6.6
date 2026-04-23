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
- `toolchain/binutils/`：宿主工具链 binutils 版本选择、补丁装载与 host 构建入口

## 构建与运行

- 通过 OpenWrt Buildroot 编译固件
- Web 默认由 `uhttpd` 提供
- LuCI 默认入口为 `/cgi-bin/luci`
- 工具链由 `toolchain/` 下各模块先构建宿主工具，再构建目标链路

## 当前任务状态

- 当前任务聚焦 `toolchain/binutils` 在 `binutils 2.42 + musl host headers` 组合下的构建失败。
- 已确认失败中断点位于 `binutils/readelf.c` 编译阶段，错误为 `off64_t` 未定义与 `fseeko64` 隐式声明，不是前面的 `ld: skipping incompatible ...` 告警。
- 已确认仓库 `toolchain/binutils/patches/2.42/` 缺少对应兼容补丁；当前实现采用最小范围修复，仅为 `2.42` 新增 `readelf` 大文件偏移兼容补丁，不调整全局 `HOST_CFLAGS` / `HOST_LDFLAGS`。
- 当前下一步为校验新增补丁文件内容与挂载位置是否正确，再由你在实际 Linux/CI 环境复编验证。

## 下一步

- 校验 `toolchain/binutils/patches/2.42/` 新增补丁命名与内容
- 在实际构建环境重新执行 `make toolchain/binutils/compile` 或完整 `make` 验证
- 若仍失败，再继续检查宿主 `gcc` wrapper 是否错误注入目标 sysroot
