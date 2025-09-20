#!/bin/bash

echo "同时部署到Gitee和GitHub..."
echo

# 检查Git状态
git status

echo
echo "添加所有文件..."
git add .

# 获取提交信息
read -p "请输入提交信息: " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Update project"
fi

echo
echo "提交变更..."
git commit -m "$commit_msg"

echo
echo "推送到Gitee..."
if git push origin main; then
    echo "✅ Gitee推送成功"
else
    echo "❌ Gitee推送失败"
fi

echo
echo "推送到GitHub..."
if git push github main; then
    echo "✅ GitHub推送成功"
else
    echo "❌ GitHub推送失败"
fi

echo
echo "🎉 部署完成！"
echo "📱 Gitee Pages: https://yourusername.gitee.io/h5-comic-reader"
echo "🌍 GitHub Pages: https://yourusername.github.io/h5-comic-reader"