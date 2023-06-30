module.exports = {
    apps : [{
      name: 'opnai',
      script: 'ts-node',
      args: './index.ts',
      watch: true,
      env: {
        NODE_ENV: 'production'
      }
    }]
  };
  