module.exports = {
  apps: [
    {
      name: 'even-dictionary',
      script: 'src/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
}
