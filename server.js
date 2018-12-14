const express = require("express");
const app = express();
const morgan = require("morgan");

const bodyParser = require("body-parser");
const passport = require("passport");

const setupPassport = require("./utilities/authenticate");
const emailRegValidity = require("./utilities/tokenExpiry");
const cors = require("cors");

const generate = require("./generateRsa");
const userRoutes = require("./api/routes/users");

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Fix cors errors
app.use(cors());

setupPassport(passport);
app.use(passport.initialize());
// app.use(passport.session());

app.use("/v1/users", userRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("[server] online " + new Date()));
