module.exports = {
  apps: [{
    name: 'franklin-virtues',
    script: 'server/app.js',
    instances: 'max', // 使用所有CPU核心
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3003
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3003
    },
    // 日志配置
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // 进程管理
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    
    // 监控配置
    watch: false,
    ignore_watch: ['node_modules', 'logs', '.git'],
    
    // 自动重启配置
    autorestart: true,
    
    // 健康检查
    health_check_grace_period: 3000,
    
    // 环境变量
    env_file: '.env'
  }],
  
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server.com'],
      ref: 'origin/main',
      repo: 'https://github.com/your-username/franklin-virtues.git',
      path: '/var/www/franklin-virtues',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt update && apt install git -y'
    }
  }
};