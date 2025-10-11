module.exports = {
  apps: [
    {
      name: 'backend-api',
      script: './node_modules/tsx/dist/cli.mjs',
      args: 'src/index.ts',
      cwd: '/var/www/sun/backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '../logs/backend-error.log',
      out_file: '../logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      watch: false,
      max_memory_restart: '500M'
    },
    {
      name: 'mobile-storefront',
      script: './node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      cwd: '/var/www/sun/customer-mobile',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '../logs/mobile-error.log',
      out_file: '../logs/mobile-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      watch: false,
      max_memory_restart: '300M'
    }
  ]
};
