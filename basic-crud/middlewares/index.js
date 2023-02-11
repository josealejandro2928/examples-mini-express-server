
const { ServerError } = require("mini-express-server");
const { User } = require("../models");


module.exports = {
    logReqMidd: (req, res, next) => {
        req.context = {};
        req.context.date = new Date();
        req.context.user = { "name": "User 1" }
        let start = performance.now();

        res.once("finish", () => {
            let end = performance.now();
            let delay = ((end - start)).toFixed(2) + " ms";
            console.log("logging: ", `${req.method}:: ${req.url} -> ${res.statusCode} :: ${delay}`)
        })
        next();
    },
    authorizationMidd: async (req, res, next) => {
        if (!req.headers.authorization)
            throw new ServerError(401, "There is not authorization header", ["You should pass a Authorization header like: Bearer "])

        let userPart = req.headers.authorization.split("Bearer ")[1]
        let userId = userPart.split("userId:")[1]
        let loggedUser = await User.getUserById(userId);
        if (!loggedUser)
            throw new ServerError(401, "Invalid user token", ["You should pass a Authorization header like: Bearer "])

        req.loggedUser = loggedUser;
        next();
    }

}