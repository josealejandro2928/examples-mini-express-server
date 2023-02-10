
const { AppServer } = require("mini-express-server");
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

const hostApp = "http://127.0.0.1:3000/static"
// Static files //
app.setStatic("/static", path.join(__dirname, ".", "static"))

const rootFolder = path.join(__dirname, ".", "static");

app.get("/", (req, res) => {
    const { query, params, body, headers } = req;
    res.status(200).json({ query, params, body, headers });
})

app.post("/upload", (req, res, next) => {
    let saveToPath = "";
    let fileName = ""
    const bb = busboy({ headers: req.headers });
    bb.on('file', (name, file, info) => {
        const { filename, encoding, mimeType } = info;
        console.log(
            `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
            filename,
            encoding,
            mimeType
        );
        saveToPath = path.join(rootFolder, filename);
        fileName = filename;
        file.pipe(fs.createWriteStream(saveToPath));
    });
    bb.on('close', () => {
        res.json({ file: hostApp + "/" + fileName, msg: "Upload successfully" })
    });
    bb.on("error", (err) => next(err))
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