const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const passport = require("passport");
const emailRegValidity = require("./utilities/tokenExpiry");
const cors = require("cors");
const generate = require("./generateRsa");
const userRoutes = require("./api/routes/users");
// const flash = require("connect-flash");

// app.use(flash());
app.use(bodyParser.urlencoded({ extended: false }));
//when false cannot post nested objects e.g.nested obj = {person:{name: cw}}
app.use(bodyParser.json());
// app.use(express.session({secret:'a random secret'}));
app.use(morgan("dev"));

// Fix cors errors
app.use(cors());

app.use(passport.initialize());
require("./utilities/authenticate")(passport);

// app.use(passport.session());

app.use("/v1/users", userRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("[server] online " + new Date()));
