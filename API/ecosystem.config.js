// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "tolva",
      script: "app.js",
      env: {
        PORT: 80,
        DIST_PATH: "../bascula/disttolva"
      }
    },
    {
      name: "bascula",
      script: "app.js",
      env: {
        PORT: 3000, 
        DIST_PATH: "../bascula/dist"
      }
    }
  ]
};
