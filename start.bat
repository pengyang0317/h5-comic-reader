@echo off
echo 启动图片阅读器...
echo.

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查npm是否可用
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: npm不可用
    pause
    exit /b 1
)

REM 检查package.json是否存在
if not exist package.json (
    echo 错误: 未找到package.json文件
    pause
    exit /b 1
)

REM 检查node_modules是否存在，如果不存在则安装依赖
if not exist node_modules (
    echo 首次运行，正在安装依赖...
    npm install
    if %errorlevel% neq 0 (
        echo 依赖安装失败，请检查网络连接
        pause
        exit /b 1
    )
)

echo 启动开发服务器...
echo 浏览器将自动打开 http://localhost:3000
echo 按 Ctrl+C 停止服务器
echo.

npm run dev

pause