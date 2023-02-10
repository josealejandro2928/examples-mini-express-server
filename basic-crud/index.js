
const { AppServer } = require("mini-express-server");

const helmet = require("helmet");
const bodyParser = require("body-parser");
const app = new AppServer();
const port = 3000;

const morgan = require("morgan");
const cors = require('cors')

app.use(morgan("common"));
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const userRouter = require("./routes/user.js");

app.get("/", (req, res) => {
    const { query, params, body, headers } = req;
    res.status(200).json({ query, params, body, headers });
})

app.use("/user", userRouter);

app.setErrorHandler((req, res, error) => {
    console.error("There is an error: ", error);
    let code = error.code && !isNaN(parseInt(error.code)) ? error.code : 500;
    res.status(code).json({ message: error.message, error: true, meta: error.meta })
})



app.listen(port, (address) => {
    console.log("Server created by mini-express-server library listening at: ", address)
})