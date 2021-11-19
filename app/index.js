const express = require("express");
const http = require("http");
const app = express();
const httpServer = http.createServer(app);

require("./util/mysql").Client.connect((err)=>{
    if(err){
        console.log("Mysql Connection Error",err);
        process.exit(0);
    }
})

httpServer.listen(process.env.APP_PORT,()=>{
    console.log(`Application Started ON Port : ${process.env.APP_PORT}`)
});

app.use(express.json())
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept , authorization");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    res.header("Access-Control-Max-Age", 86400);
    next();
});
app.use(require("./interceptors/optionReq"));
app.use(require("./router"))

app.use((err, req, res, next) => {
    console.log(err);
    if (typeof err.error === "object" && typeof err.error.message === "string" && typeof err.error.code === "string") {
        err.message = err.error.message;
        err.error = err.error.code;
    } else {
        err.message = err.error;
        err.error = "UNEXPECTED_ERROR";
    }
    //logger.debug(error,"Request Error");
    const statusCode = err.statusCode || 500;
    delete err.statusCode;
    return res.status(statusCode).json(err);
});