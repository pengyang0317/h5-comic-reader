@echo off
echo 同时部署到Gitee和GitHub...
echo.

REM 检查Git状态
git status

echo.
echo 添加所有文件...
git add .

REM 获取提交信息
set /p commit_msg="请输入提交信息: "
if "%commit_msg%"=="" set commit_msg="Update project"

echo.
echo 提交变更...
git commit -m "%commit_msg%"

echo.
echo 推送到Gitee...
git push origin main
if %errorlevel% neq 0 (
    echo Gitee推送失败
) else (
    echo Gitee推送成功
)

echo.
echo 推送到GitHub...
git push github main
if %errorlevel% neq 0 (
    echo GitHub推送失败
) else (
    echo GitHub推送成功
)

echo.
echo 部署完成！
echo Gitee Pages: https://pengyang317.gitee.io/h5-comic-reader
echo GitHub Pages: https://pengyang0317.github.io/h5-comic-reader
pause