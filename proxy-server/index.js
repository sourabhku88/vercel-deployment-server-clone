const express = require('express')
const httpProxy = require('http-proxy');


const app = express();
const port = 8000;
// const BASE_URL = 'https://projectshost.s3.ap-south-1.amazonaws.com/__outputs'
const BASE_URL = `https://${bucket_name}.s3.ap-south-1.amazonaws.com/__outputs`

const proxy = httpProxy.createProxy();

app.use((req, res) => {
    const hostnamae = req.hostname;
    const subdomain = hostnamae.split('.')[0];

    const resolveTo = `${BASE_URL}/${subdomain}`;
    return proxy.web(req, res, { target: resolveTo, changeOrigin: true });
});

proxy.on("proxyReq", (proxyReq, req, res) => {
    if (req.url === '/') {
        proxyReq.path += 'index.html';
    }
    return proxyReq
});

app.use((req, res) => {
    res.status(404).send('Not Found')
})


app.listen(port, () => {
    console.log(`Proxy Server Starting at http://localhost:${port}`)
})