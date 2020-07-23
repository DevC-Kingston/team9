import express from "express";
import homecontrol from "../controller/homecontrol";

let router = express.Router();

let initWebRoutes = (app) =>{
    router.get("/",homecontrol.getHomepage);

    return app.use("/",router);
};

module.exports = initWebRoutes;
