module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/sun/backend',
      interpreter: 'none',
      exec_mode: 'cluster',
      instances: 2,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_log: '/var/www/sun/backend/logs/backend-error.log',
      out_log: '/var/www/sun/backend/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      watch: false,
      kill_timeout: 5000,
      listen_timeout: 10000,
      wait_ready: true
    },
    {
      name: 'mobile',
      script: 'npm',
      args: 'run start:mobile',
      cwd: '/var/www/sun',
      interpreter: 'none',
      exec_mode: 'cluster',
      instances: 2,
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_log: '/var/www/sun/logs/mobile-error.log',
      out_log: '/var/www/sun/logs/mobile-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      watch: false,
      kill_timeout: 5000,
      listen_timeout: 10000,
      wait_ready: true
    }
  ]
};
