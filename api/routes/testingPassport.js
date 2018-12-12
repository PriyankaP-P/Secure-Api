// / router.get("/totp-setup", isLoggedIn, ensureTotp, function(req, res) {
//   let url = null;

//   if (req.user.key) {
//     let qrData = sprintf(
//       "otpauth://totp/%s?secret=%s",
//       req.user.username,
//       req.user.key
//     );
//     url =
//       "https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=" +
//       qrData;
//   }
//   //enable jwt login here??
//   res.render("totp-setup", {
//     strings: strings,
//     user: req.user,
//     qrUrl: url
//   });
// });

// router.post("/totp-setup", isLoggedIn, ensureTotp, function(req, res) {
//   if (req.body.totp) {
//     req.session.method = "totp";

//     let secret = base32.encode(crypto.randomBytes(16));
//     //Discard equal signs (part of base32,
//     //not required by Google Authenticator)
//     //Base32 encoding is required by Google Authenticator.
//     //Other applications
//     //may place other restrictions on the shared key format.
//     secret = secret.toString().replace(/=/g, "");
//     req.user.key = secret;
//   } else {
//     req.session.method = "jwt";

//     req.user.key = null;
//   }

//   res.redirect("/totp-setup");
// });

// router.post(
//   "/login",
//   passport.authenticate("jwt", { failureRedirect: "/login" }),
//   function(req, res) {
//     if (req.user.key) {
//       req.session.method = "totp";
//       res.redirect("/totp-input");
//     } else {
//       req.session.method = "jwt";
//       res.redirect("/totp-setup");
//     }
//   }
// );

// function isLoggedIn(req, res, next) {
//   if (req.isAuthenticated()) {
//     next();
//   } else {
//     res.redirect("/login");
//   }
// }

// function ensureTotp(req, res, next) {
//   if (
//     (req.user.key && req.session.method == "totp") ||
//     (!req.user.key && req.session.method == "jwt")
//   ) {
//     next();
//   } else {
//     res.redirect("/login");
//   }
// }

// // router.get("/profile/:id", (req, res) => {
// //   const { id } = req.params;
// //   knex
// //     .select("*")
// //     .from("users")
// //     .where({ id: id })
// //     .then(user => {
// //       if (user.length) {
// //         res.json({
// //           id: user[0].id,
// //           email: user[0].email,
// //           registered: user[0].registered
// //         });
// //       } else {
// //         res.status(400).json("User not found");
// //       }
// //     })
// //     .catch(err => res.status(400).json("Bad request"));
// // });

// router.get("/account", loggedin.ensureLoggedIn(), ensureSecondFactor, function(
//   req,
//   res
// ) {
//   res.render("account", { user: req.user });
// });

// router.get("/setup", loggedin.ensureLoggedIn(), function(req, res, next) {
//   knex
//     .select("key_tfa", "period_tfa")
//     .from("users")
//     .where({ id: user.id })
//     .then(user => {
//       if (user.length) {
//         let encodedKey = base32.encode(obj.key);

//         let otpUrl =
//           "otpauth://totp/" +
//           req.user.email +
//           "?secret=" +
//           encodedKey +
//           "&period=" +
//           (obj.period || 30);
//         let qrImage =
//           "https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=" +
//           encondeURIComponent(otpUrl);

//         res.render("setup", {
//           user: req.user,
//           key: encodedKey,
//           qrImage: qrImage
//         });
//       } else {
//         // new two-factor setup.  generate and save a secret key
//         let key = utils.randomKey(10);
//         let encodedKey = base32.encode(key);

//         // generate QR code for scanning into Google Authenticator
//         // reference: https://code.google.com/p/google-authenticator/wiki/KeyUriFormat

//         let otpUrl =
//           "otpauth://totp/" +
//           req.user.email +
//           "?secret=" +
//           encodedKey +
//           "&period=30";
//         let qrImage =
//           "https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=" +
//           encodeURIComponent(otpUrl);

//         knex
//           .table("users")
//           .where("id", req.user.id)
//           .insert({ key_tfa: key, period_tfa: 30 })
//           .them(user => {
//             res.render("setup", {
//               user: req.user,
//               key: encodedKey,
//               qrImage: qrImage
//             });
//           })
//           .catch(err => {
//             return next(err);
//           });
//       }
//     })
//     .catch(err => res.status(400).json("Bad request"));
// });

// router.get("/login", function(req, res) {
//   res.render("login", { user: req.user, message: req.flash("error") });
// });

// router.post(
//   "/login",
//   passport.authenticate("local", {
//     failureRedirect: "/login",
//     failureflash: true
//   }),
//   function(req, res) {
//     res.redirect("/");
//   }
// );

// router.get(
//   "/login-otp",
//   loggedin.ensureLoggedIn(),
//   function(req, res, next) {
//     // If user hasn't set up two-factor auth, redirect
//     knex
//       .tables("user")
//       .where("id", req.user.id)
//       .select("key_tfa")
//       .then(theKey => {
//         if (!theKey.length) return res.redirect("/setup");
//         return next();
//       })
//       .catch(err => {
//         return next(err);
//       });
//   },
//   function(req, res) {
//     res.render("login-otp", {
//       user: req.user,
//       message: req.flash("error")
//     });
//   }
// );

// function ensureSecondFactor(req, res, next) {
//   if (req.session.secondFactor == "totp") {
//     return next();
//   }
//   res.redirect("/login-otp");
// }
