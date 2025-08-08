#!/bin/bash

# 富兰克林13美德系统部署脚本
# 使用方法: ./deploy.sh [development|production]

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 检查参数
ENV=${1:-development}
if [[ "$ENV" != "development" && "$ENV" != "production" ]]; then
    print_error "无效的环境参数。使用: $0 [development|production]"
    exit 1
fi

print_message "开始部署富兰克林13美德系统 - 环境: $ENV"

# 检查必要的工具
print_step "检查必要工具..."
command -v docker >/dev/null 2>&1 || { print_error "需要安装Docker"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { print_error "需要安装Docker Compose"; exit 1; }

# 检查环境变量文件
print_step "检查环境配置..."
if [[ ! -f .env ]]; then
    if [[ -f .env.example ]]; then
        print_warning "未找到.env文件，从.env.example复制"
        cp .env.example .env
        print_warning "请编辑.env文件设置正确的配置"
    else
        print_error "未找到.env.example文件"
        exit 1
    fi
fi

# 创建必要的目录
print_step "创建必要目录..."
mkdir -p logs
mkdir -p ssl

# 构建和启动服务
if [[ "$ENV" == "production" ]]; then
    print_step "生产环境部署..."
    
    # 停止现有服务
    print_message "停止现有服务..."
    docker-compose down || true
    
    # 构建镜像
    print_message "构建Docker镜像..."
    docker-compose build --no-cache
    
    # 启动服务
    print_message "启动生产服务..."
    docker-compose up -d
    
    # 等待服务启动
    print_message "等待服务启动..."
    sleep 10
    
    # 健康检查
    print_step "执行健康检查..."
    if curl -f http://localhost:3003/api/health >/dev/null 2>&1; then
        print_message "✅ 应用健康检查通过"
    else
        print_error "❌ 应用健康检查失败"
        docker-compose logs app
        exit 1
    fi
    
else
    print_step "开发环境部署..."
    
    # 安装依赖
    print_message "安装Node.js依赖..."
    npm install
    
    # 启动MongoDB（如果使用Docker）
    print_message "启动MongoDB..."
    docker-compose up -d mongodb
    
    # 等待MongoDB启动
    sleep 5
    
    # 启动应用
    print_message "启动开发服务器..."
    npm run dev &
    
    print_message "开发服务器已启动，访问 http://localhost:3003"
fi

# 显示服务状态
print_step "服务状态检查..."
if [[ "$ENV" == "production" ]]; then
    docker-compose ps
else
    print_message "开发模式 - 使用 'npm run dev' 启动"
fi

# 显示访问信息
print_step "部署完成！"
print_message "应用访问地址: http://localhost:3003"
print_message "API健康检查: http://localhost:3003/api/health"

if [[ "$ENV" == "production" ]]; then
    print_message "查看日志: docker-compose logs -f"
    print_message "停止服务: docker-compose down"
fi

print_message "🎉 富兰克林13美德系统部署成功！"