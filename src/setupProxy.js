const proxy = require('http-proxy-middleware');
module.exports = function (app) {
    app.use(
        '/api',
        proxy({
            target: 'http://localhost:8002',
            changeOrigin: true,
        })
    );
};