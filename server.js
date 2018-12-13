const express = require("express");
const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const passport = require("passport");
// const session = require("express-session");
const setupPassport = require("./utilities/authenticate");
const emailRegValidity = require("./utilities/tokenExpiry");
const cors = require("cors");

const generate = require("./generateRsa");
const userRoutes = require("./api/routes/users");

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Fix cors errors
app.use(cors());

// app.use(
//   session({
//     secret: "0_v7^^JxCcUJLGNeYf6l",
//     name: "SessionID",
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//       // secure: true,        // Use in production. Send session cookie only over HTTPS
//       httpOnly: true
//     }
//   })
// );

setupPassport(passport);
app.use(passport.initialize());
// app.use(passport.session());

app.use("/v1/users", userRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("[server] online " + new Date()));
