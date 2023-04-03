module.exports = {
  apps: [
    {
        name: 'ApiServer',
        script: './index.js',
        watch: false,
        instance: 4,
        exec_mode: 'cluster',
        instance_var: 'INSTANCE_ID',
        env: {
            "PORT": 3000,
            "NODE_ENV": "development"
        },
        env_production: {
            "PORT": 3000,
            "NODE_ENV": "production"
        }
    }
  ]
}
