module.exports = {
  apps: [
    {
      name: 'LovojBackendB2BStaging',
      script: 'server.js',
      env: {
        NODE_ENV: 'staging'
      }
    },
    {
      name: 'LovojBackendB2BLive',
      script: 'server.js',
      env: {
        NODE_ENV: 'live'
      }
    }
  ]
};
