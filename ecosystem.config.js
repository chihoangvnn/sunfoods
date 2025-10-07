module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'npm',
      args: 'start',
      cwd: './backend',
      exec_mode: 'cluster',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_log: './logs/backend-error.log',
      out_log: './logs/backend-out.log',
      watch: false,
      max_memory_restart: '1G',
      autorestart: true,
      max_restarts: 10
    },
    {
      name: 'mobile',
      script: 'npm',
      args: 'start',
      cwd: './customer-mobile',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_log: './logs/mobile-error.log',
      out_log: './logs/mobile-out.log',
      watch: false,
      max_memory_restart: '1G',
      autorestart: true,
      max_restarts: 10
    }
  ]
};
