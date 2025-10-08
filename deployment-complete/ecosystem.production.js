module.exports = {
  apps: [
    {
      name: 'sunfoods-backend',
      script: './dist/index.js',
      cwd: '/var/www/sunfoods/backend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      
      // Auto restart configuration
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      
      // PM2 health monitoring
      wait_ready: false,
      listen_timeout: 10000,
      kill_timeout: 5000,
      
      // Logging
      error_file: '/var/www/sunfoods/logs/backend-error.log',
      out_file: '/var/www/sunfoods/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Advanced features
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Exponential backoff restart delay
      exp_backoff_restart_delay: 100,
      
      // Environment variables from .env file
      env_file: '/var/www/sunfoods/backend/.env'
    }
  ]
};
