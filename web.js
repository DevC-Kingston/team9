import express from "express";
import homecontrol from "homecontrol";

let router = express.Router();

let initWebRoutes = (app) =>{
    router.get("/",homecontrol.getHomepage);

    return app.use("/",router);
};

module.exports = initWebRoutes;
