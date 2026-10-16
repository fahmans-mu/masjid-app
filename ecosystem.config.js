module.exports = {
  apps: [
    {
      name: "masjid",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 80,
      },
      max_memory_restart: "450M",
    },
  ],
};
