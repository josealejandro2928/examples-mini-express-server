
const { AppServer, ServerError } = require("mini-express-server");

const morgan = require("morgan");
const cors = require('cors')
const helmet = require("helmet");
const path = require("node:path");
const fs = require("node:fs");
var compression = require('compression')

const app = new AppServer();
const port = 3000;

app.use(morgan("common"));
app.use(cors());
app.use(helmet());
app.use(compression());

// Static files //
app.setStatic("/static", path.join(__dirname, ".", "static"))
const pagesRootPath = path.resolve(__dirname, "pages");

app.get("/", (req, res, ) => {
    res.status(200).sendFile(path.resolve(pagesRootPath, "portfolio.html"));
})

app.get("/:page", (req, res, next) => {
    let page = req.params.page;
    fs.readdir(pagesRootPath, { encoding: "utf8" }, (err, files) => {
        if (err) {
            next(err);
        } else {
            let fileFound = files.find((file) => file == (page + ".html"))
            if (fileFound) return res.status(200).sendFile(path.resolve(pagesRootPath, fileFound));
            return next(new ServerError(404, "Page not found", [{ "websites": files }]));
        }
    })
})
///////////////////////////////////////////////////////////////////////////////

app.setErrorHandler((req, res, error) => {
    console.error("There is an error: ", error);
    let code = error.code && !isNaN(parseInt(error.code)) ? error.code : 500;
    res.status(code).json({ message: error.message, error: true, meta: error.meta })
})



app.listen(port, (address) => {
    console.log("Server created by mini-express-server library listening at: ", address)
})