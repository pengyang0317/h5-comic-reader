#!/bin/bash

echo "启动图片阅读器..."
echo

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未找到Node.js，请先安装Node.js"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

# 检查npm是否可用
if ! command -v npm &> /dev/null; then
    echo "错误: npm不可用"
    exit 1
fi

# 检查package.json是否存在
if [ ! -f "package.json" ]; then
    echo "错误: 未找到package.json文件"
    exit 1
fi

# 检查node_modules是否存在，如果不存在则安装依赖
if [ ! -d "node_modules" ]; then
    echo "首次运行，正在安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "依赖安装失败，请检查网络连接"
        exit 1
    fi
fi

echo "启动开发服务器..."
echo "浏览器将自动打开 http://localhost:3000"
echo "按 Ctrl+C 停止服务器"
echo

npm run dev