# 项目概览

基于 ImmortalWrt 的固件源码仓库，面向路由器等嵌入式设备构建系统镜像、工具链与软件包。

# 技术栈

- GNU Make 构建系统
- Linux 交叉编译工具链
- OpenWrt / ImmortalWrt 包与目标平台目录结构

# 目录结构

- `toolchain/`：交叉工具链构建
- `package/`：软件包定义
- `target/`：目标平台与设备配置
- `include/`：顶层构建规则与公共宏

# 关键模块

- `toolchain/binutils/`：binutils 下载、补丁、配置与宿主机构建入口

# 构建与运行

- 常规入口为仓库根目录执行 `make`
- `toolchain/binutils/Makefile` 根据 `CONFIG_BINUTILS_VERSION` 选择源码版本和补丁目录

# 当前任务状态

- 已定位 `toolchain/binutils` 在 `binutils 2.42` 构建阶段失败
- 已确认当前阻塞根因是 `binutils/readelf.c` 在 musl 宿主构建时错误进入 `off64_t` / `fseeko64` 分支
- 已恢复 `patches/2.42/004-readelf-use-fseeko64-or-fseeko-if-possible.patch`，并改为仅修正 `readelf.c` 的 `fseek64()` 分支选择
- 下一步：校验补丁内容与补丁序列，然后在构建环境中重新验证

# 下一步

- 校验 `2.42` 目录补丁序列与新 `004` 内容
- 在构建环境中重新验证 `binutils 2.42` 补丁应用与编译流程
