module.exports = {
    apps: [
      {
        name: 'dabada',
        script: 'node_modules/next/dist/bin/next',
        args: 'start',
        instances: 2, // CPU 코어 수에 맞게 조정
        exec_mode: 'cluster',
        env: {
          NODE_ENV: 'production',
          PORT: 3030,
        },
        error_file: './logs/pm2-error.log',
        out_file: './logs/pm2-out.log',
        log_file: './logs/pm2-combined.log',
        time: true,
        autorestart: true,
        max_memory_restart: '1G',
        watch: false,
        ignore_watch: ['node_modules', 'logs', '.next'],
        merge_logs: true,
      },
    ],
  };