# Sea Lantern v0.1.2 Release Notes

> 发布日期: 2025-02-11

## 🎉 版本亮点

本次更新主要聚焦于**品牌视觉升级**和**用户体验优化**，为Sea Lantern带来全新的视觉形象。

## 📦 下载地址

**Gitee Release**: https://gitee.com/FPS_Z/SeaLantern/releases/tag/v0.1.2

### 安装包列表

| 文件名 | 大小 | 说明 |
|--------|------|------|
| `Sea Lantern_0.1.2_x64-setup.exe` | 2.6 MB | **推荐** NSIS安装程序，安装速度快 |
| `Sea Lantern_0.1.2_x64_zh-CN.msi` | 3.9 MB | MSI安装包，企业环境推荐使用 |

## ✨ 更新内容

### 🎨 视觉优化

- ✅ **全新Logo设计**
  - 更新侧边栏Logo为新设计的SVG图标
  - 更新关于页面的Hero Section Logo
  - 更新启动动画Logo，提升品牌识别度

- ✅ **应用图标更新**
  - 使用新Logo生成全平台应用图标
  - 支持Windows (.ico)、macOS (.icns)
  - 支持iOS和Android各种分辨率
  - 支持Windows Store各种尺寸

- ✅ **Web优化**
  - 更新网页标题为 "Sea Lantern"
  - 更新Favicon为新Logo

### 🐛 Bug修复

- ✅ **修复启动服务器时弹出空白PowerShell窗口的问题**
  - 在Windows平台上启动Minecraft服务器进程时，添加`CREATE_NO_WINDOW`标志
  - 服务器进程在后台运行，不再弹出干扰用户的空白控制台窗口
  - 服务器输出仍然通过管道正常捕获到应用日志中

## 🔧 技术改进

- 优化进程管理机制，提升稳定性
- 改进跨平台兼容性（使用条件编译）
- 代码质量提升

## 📸 界面预览

### 新Logo展示

- **启动动画**: 应用启动时展示新Logo，带有流畅的缩放动画
- **侧边栏**: 左上角显示简洁的新Logo图标
- **关于页面**: 大尺寸Logo配合产品信息展示

## ⚙️ 系统要求

- **操作系统**: Windows 10/11 (x64)
- **Java**: 推荐Java 8或更高版本（用于运行Minecraft服务器）
- **内存**: 推荐4GB及以上
- **磁盘空间**: 至少500MB可用空间

## 🚀 安装说明

1. 下载 `Sea Lantern_0.1.2_x64-setup.exe`
2. 双击运行安装程序
3. 按照安装向导完成安装
4. 启动Sea Lantern，开始管理你的Minecraft服务器！

## 📝 更新方法

如果你已经安装了旧版本：

1. 建议先备份服务器配置（应用会自动保存在 `~/.sea-lantern` 目录）
2. 卸载旧版本或直接覆盖安装
3. 启动新版本，所有配置和服务器信息将自动迁移

## 🐛 已知问题

- 无

## 🙏 致谢

感谢所有使用Sea Lantern的用户！你们的反馈和建议是我们持续改进的动力。

## 📞 反馈渠道

- **Issues**: https://gitee.com/FPS_Z/SeaLantern/issues
- **Pull Requests**: https://gitee.com/FPS_Z/SeaLantern/pulls

---

**完整更新日志**: https://gitee.com/FPS_Z/SeaLantern/compare/v0.1.1...v0.1.2
