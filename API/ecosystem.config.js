// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "tolva-app",
      script: "app.js",
      instances: "max",
      exec_mode: "cluster",
      max_memory_restart: "500M",
      restart_delay: 5000,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/tolva-error.log",
      out_file: "./logs/tolva-out.log",
      merge_logs: true,
      env: {
        NODE_ENV: "production",
        PORT: 80,
        DIST_PATH: "../bascula/disttolva"
      }
    },
    {
      name: "bascula-app",
      script: "app.js",
      instances: "max",
      exec_mode: "cluster",
      max_memory_restart: "500M",
      restart_delay: 5000,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/bascula-error.log",
      out_file: "./logs/bascula-out.log",
      merge_logs: true,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        DIST_PATH: "../bascula/dist"
      }
    }
  ]
};