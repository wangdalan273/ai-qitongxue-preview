@echo off
echo ========================================
echo 创建版本标签 v1.0.0
echo ========================================
echo.

cd /d D:\ai-qitongxue-preview

echo [1/2] 创建本地标签...
git tag -a v1.0.0 -m "Release v1.0.0: Ai淇橦学排版预览"

echo.
echo [2/2] 推送标签到 GitHub...
git push origin v1.0.0

echo.
echo ========================================
echo ✅ 标签创建完成！
echo ========================================
echo.
echo 下一步：
echo 访问 https://github.com/wangdalan273/ai-qitongxue-preview/releases/new
echo 选择标签 v1.0.0 创建 Release
echo.

pause
