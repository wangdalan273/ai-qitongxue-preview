@echo off
echo ========================================
echo Ai淇橦学排版预览 - GitHub 发布工具
echo ========================================
echo.

cd /d D:\ai-qitongxue-preview

echo [1/5] 初始化 Git 仓库...
git init

echo.
echo [2/5] 添加所有文件...
git add .

echo.
echo [3/5] 创建初始提交...
git commit -m "Initial commit: Ai淇橦学排版预览 v1.0.0"

echo.
echo [4/5] 关联远程仓库...
git remote add origin https://github.com/wangdalan273/ai-qitongxue-preview.git

echo.
echo [5/5] 推送到 GitHub...
git branch -M main
git push -u origin main

echo.
echo ========================================
echo ✅ 推送完成！
echo ========================================
echo.
echo 下一步：
echo 1. 访问 https://github.com/wangdalan273/ai-qitongxue-preview
echo 2. 创建 Release
echo 3. 运行 create-tag.bat 创建版本标签
echo.

pause
