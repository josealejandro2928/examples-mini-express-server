
const { AppServer } = require("mini-express-server");
const crypto = require("crypto");
const busboy = require('busboy');

const morgan = require("morgan");
const cors = require('cors')
const helmet = require("helmet");
const path = require("node:path");
const fs = require("node:fs");
const bodyParser = require("body-parser");

const app = new AppServer();
const port = 3000;

app.use(morgan("common"));
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const serveIndex = require('serve-index')

const hostApp = "http://127.0.0.1:3000/static"
// Static files //
app.setStatic("/static", path.join(__dirname, ".", "static"))

const rootFolder = path.join(__dirname, ".", "static");

app.use("/", serveIndex(path.join(__dirname, ".", "static"), { 'icons': true }))

app.get("/:item", (req, res) => {
    req.pathName = "/static" + req.pathName.replace(/%20/g, " ");
    // redirect to the static files
    app.routesHandler(req, res, null);
})

app.post("/upload", (req, res, next) => {
    let saveToPath = "";
    let fileName = ""
    const bb = busboy({ headers: req.headers });
    bb.once('file', (name, file, info) => {
        const { filename, encoding, mimeType } = info;
        console.log(
            `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
            filename,
            encoding,
            mimeType
        );
        let fileUuid = crypto.randomBytes(12).toString("hex");
        saveToPath = path.join(rootFolder, fileUuid + "_" + filename);
        fileName = fileUuid + "_" + filename;
        file.pipe(fs.createWriteStream(saveToPath));
    });
    bb.once('close', () => {
        bb.removeListener("error", next);
        res.json({ file: hostApp + "/" + fileName, msg: "Upload successfully" })
    });
    bb.once("error", next)
    req.pipe(bb);
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