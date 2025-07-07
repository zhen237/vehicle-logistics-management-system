@echo off
echo ========================================
echo 重新部署到 GitHub Pages
echo ========================================
echo.

echo 1. 清理并重新构建...
call npm run build
if %errorlevel% neq 0 (
    echo 构建失败！
    pause
    exit /b 1
)

echo.
echo 2. 复制构建文件到根目录...
copy dist-production\index.html . /Y
copy dist-production\favicon.ico . /Y
if exist assets rmdir /s /q assets
xcopy dist-production\assets assets\ /E /I /Y

echo.
echo 3. 添加所有文件...
git add .

echo.
echo 4. 提交更改...
git commit -m "redeploy to fix 404"

echo.
echo 5. 推送到 GitHub...
git push origin main

echo.
echo ========================================
echo 部署完成！
echo 请等待 3-5 分钟后访问：
echo https://zhen237.github.io/vehicle-logistics-management-system/
echo ========================================
pause
