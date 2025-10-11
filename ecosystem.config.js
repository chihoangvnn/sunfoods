module.exports = {
  apps: [
    {
      name: 'backend-api',
      cwd: './backend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: '5000'
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'sunfoods-storefront',
      cwd: './customer-mobile',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: '3001',
        NEXT_PUBLIC_API_URL: 'https://sunfoods.vn/api'
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M'
    },
    {
      name: 'tramhuong-storefront',
      cwd: './customer-tramhuong',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: '3002',
        NEXT_PUBLIC_API_URL: 'https://tramhuonghoangngan.com/api'
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M'
    },
    {
      name: 'nhangsach-storefront',
      cwd: './customer-nhangsach',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: '3003',
        NEXT_PUBLIC_API_URL: 'https://nhangsach.net/api'
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M'
    }
  ]
};
