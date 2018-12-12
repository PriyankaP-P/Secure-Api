//users.js with ras key pair

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");
const knex = require("../../knex");
const crypto = require("crypto");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

const loggedin = require("connect-ensure-login");
const base32 = require("thirty-two");
const utils = require("../../utilities/utils");

const fs = require("fs");
let path = require("path");
let filePathPriv = path.join(__dirname, "../../../private.pem");
const secretSent = fs.readFileSync(filePathPriv, { encoding: "utf-8" });

let filePathPub = path.join(__dirname, "../../../public.pem");
let secretReturned = fs.readFileSync(filePathPub, { encoding: "utf-8" });

const sendemail = require("../../utilities/sendEmail");

const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const validateEmail = require("../../validation/checkEmail");
const validatePasswordChange = require("../../validation/newPassword");
// const validateChoice = require("../../validation/enable2faChoice");

router.post("/register", (req, res) => {
  let token;
  const { errors, isValid } = validateRegisterInput(req.body);

  crypto.randomBytes(48, (err, buf) => {
    if (err) throw err;
    token = buf
      .toString("base64")
      .replace(/\//g, "")
      .replace(/\+/g, "-");
    return token;
  });

  if (!isValid) {
    return res.status(400).json(errors);
  }

  bcrypt.genSalt(12, (err, salt) => {
    if (err) throw err;
    bcrypt.hash(req.body.password, salt, (err, hash) => {
      if (err) throw err;
      knex("users")
        .returning(["email", "token"])
        .insert({
          email: req.body.email,
          password: hash,
          registered: Date.now(),
          token: token,
          createdtime: Date.now(),
          emailverified: "f",
          tokenusedbefore: "f",
          tfa_enabled: false
        })
        .then(user => {
          let to = [user[0].email];
          let link =
            "https://api.simplecode.io/v1/users/verify/" + user[0].token;
          let sub = "Register User To SimpleCode!";
          let content =
            "<body><p>Welcome to Simplecode! Your one stop guide to coding solutions.</p> <a href=" +
            link +
            ">Verify email</a></body>";

          sendemail.emailService(to, sub, content);

          res.json(`Successful registration!`);
        })
        .catch(err => {
          console.log(err);
          errors.account = "Email already registered";
          res.status(400).json(errors);
        });
    });
  });
});

router.get("/verify/:token", (req, res) => {
  const { token } = req.params;
  const errors = {};
  knex
    .returning(["email", "emailverified", "tokenusedbefore"])
    .from("users")
    .where({ token: token, tokenusedbefore: "f" })
    .update({ emailverified: "t", tokenusedbefore: "t" })
    .then(data => {
      if (data.length > 0) {
        res.json(
          "Email verified! Please login to SimpleCode.io to access your account"
        );
      } else {
        knex
          .select("email", "emailverified", "tokenusedbefore")
          .from("users")
          .where("token", token)
          .then(check => {
            if (check.length > 0) {
              if (check[0].emailverified) {
                errors.alreadyVerified =
                  "Email already verified. Please login to SimpleCode.io to access your account.";
                res.status(400).json(errors);
              }
            } else {
              errors.email_invalid =
                "Email invalid. Please check if you have registered with the correct email address or re-send the verification link to your email.";
              res.status(400).json(errors);
            }
          })
          .catch(err => {
            errors.db = "Bad request";
            res.status(400).json(errors);
          });
      }
    })
    .catch(err => {
      errors.db = "Bad request";
      res.status(400).json(errors);
    });
});

router.post("/resend_email", (req, res) => {
  let resendToken;

  const { errors, isValid } = validateEmail(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  crypto.randomBytes(48, (err, buf) => {
    if (err) throw err;
    resendToken = buf
      .toString("base64")
      .replace(/\//g, "")
      .replace(/\+/g, "-");
    return resendToken;
  });

  knex
    .table("users")
    .select("*")
    .where({ email: req.body.email })
    .then(data => {
      if (data.length == 0) {
        errors.invalid = "Invalid email address. Please register again!";
        res.status(400).json(errors);
      } else {
        knex
          .table("users")
          .returning(["email", "token"])
          .where({ email: data[0].email, emailverified: "false" })
          .update({ token: resendToken, createdtime: Date.now() })
          .then(result => {
            if (result.length) {
              let to = [result[0].email];

              let link =
                "https://api.simplecode.io/v1/users/verify/" + result[0].token;

              let sub = "Confirm your registration with Simplecode!";

              let content =
                "<body><p>You have not yet verified your Simplecode account.Please verify your email address.</p> <a href=" +
                link +
                ">Verify email</a></body>";

              sendemail.emailService(to, sub, content);

              res.json("Email re-sent!");
            } else {
              errors.alreadyVerified =
                "Email address has already been verified, please login.";
              res.status(400).json(errors);
            }
          })
          .catch(err => {
            errors.db = "Bad request";
            res.status(400).json(errors);
          });
      }
    })
    .catch(err => {
      errors.db = "Bad request";
      res.status(400).json(errors);
    });
});

// router.get("/enable2fa/:id", (req, res) => {
//   const { id } = req.params;
//   const errors = {};

//   let secret = speakeasy.generateSecret({ length: 20 });
//   let key = secret.base32;
//   // console.log(key);

//   knex
//     .table("users")
//     .returning("email")
//     .where({ id: id, emailverified: true })
//     .update("key_tfa", key) //secure in database later
//     .then(row => {
//       if (row.length) {
//         QRCode.toDataURL(
//           secret.otpauth_url,
//           // { errorCorrectionLevel: "H" },
//           function(err, image_data) {
//             if (err) {
//               errors.tfaCode =
//                 "There was an error while enabling 2-factor authentication for this account! Please try again.";
//               res.status(400).json(errors);
//             }
//             console.log(row[0]);
//             knex
//               .table("users")
//               .where("id", id)
//               .update("tfa_enabled", true)
//               .then(enabled => {
//                 if (enabled) {
//                   console.log("Tfa enabled for " + row[0] + ".");
//                   res.json(image_data);
//                 }
//               })
//               .catch(err => {
//                 console.log(err);
//                 errors.tfaCode =
//                   "There was an error while enabling 2-factor authentication for this account! Please try again.";
//                 res.status(400).json(errors);
//               });
//             let to = [row[0]];

//             let sub =
//               "Enabled two factor authentication for your Bitomic account!";

//             let content =
//               "<body><p>Congratulations, you have enabled two factor authentication for you Bitomic account.</p> </body>";

//             sendemail.emailService(to, sub, content);
//           }
//         );
//       } else {
//         errors.unverified = "Invalid email address";
//         res.status(400).json(errors);
//       }
//     })
//     .catch(err => {
//       console.log(err);
//       errors.tfaCode =
//         "There was an error while enabling 2-factor authentication for this account! Please try again.";
//       res.status(400).json(errors);
//     });
// });

// router.get("/login", (req, res) => {
function jwtLogin(req, res, next) {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }
  knex
    .select("id", "email", "password", "registered")
    .where("email", "=", req.body.email)
    .andWhere("emailverified", true)
    .from("users")
    .then(data => {
      if (data.length) {
        bcrypt.compare(req.body.password, data[0].password).then(isMatch => {
          if (isMatch) {
            const payload = { id: data[0].id }; //, registered: data[0].registered
            jwt.sign(
              payload,
              keys.secretOrKey,
              { expiresIn: 3600 },
              (err, token) => {
                knex
                  .table("users")
                  .where("email", "=", data[0].email)
                  .select("tfa_enabled")
                  .then(tfaEnabled => {
                    // console.log(tfaEnabled[0].tfa_enabled);
                    if (!tfaEnabled[0].tfa_enabled) {
                      res.json({
                        success: true,
                        token: "Bearer " + token
                      });
                    } else {
                      console.log("Tfa enabled");
                      req.sendingToken = {
                        id: data[0].id,
                        token: "Bearer " + token
                      };
                      return next();
                      // res.redirect("/verify2fa");
                    }
                  })
                  .catch(err => {
                    errors.invalid = "Invalid email/password";
                    res.status(400).json(errors);
                  });
              }
            );
          } else {
            errors.invalid = "Invalid email/password";
            res.status(400).json(errors);
          }
        });
      } else {
        errors.invalid = "Invalid email/password";
        res.status(400).json(errors);
      }
    })
    .catch(err => {
      errors.invalid = "Invalid email/password";
      res.status(400).json(errors);
    });
}
// });

// router.post("/forgot", function(req, res) {
//   const { errors, isValid } = validateEmail(req.body);

//   if (!isValid) {
//     return res.status(400).json(errors);
//   }

//   let sendToken;
//   knex
//     .table("users")
//     .select("*")
//     .where({ email: req.body.email, emailverified: "true" })
//     .then(data => {
//       console.log(data.length);
//       if (data.length == 0) {
//         errors.invalid = "Invalid email address";
//         res.status(400).json(errors);
//       } else {
//         knex
//           .table("users")
//           .where("email", data[0].email)
//           .select("id")
//           .then(userId => {
//             if (userId.length) {
//               sendToken = jwt.sign({ id: userId[0] }, secretSent, {
//                 expiresIn: 60000 * 30,
//                 issuer: "Cloudgiant enterprises",
//                 algorithm: "RS256"
//               });

//               knex
//                 .table("users")
//                 .returning(["email", "resetpasswordtoken"])
//                 .where("email", data[0].email)
//                 .update({
//                   resetpasswordtoken: sendToken,
//                   resetpasswordexpires: Date.now(),
//                   resettokenusedbefore: false
//                 })
//                 .then(row => {
//                   let to = [row[0].email];

//                   let linkPasswdReset =
//                     "https://app.simplecode.io/reset/" +
//                     data[0].resetpasswordtoken;

//                   let sub = "Password Reset For Your SimpleCode Account";

//                   let content =
//                     "<body><p>You are receiving this email because a request for the reset of your password for your SimpleCode account was received. \n If you did not request this, please ignore this email and your password will remain unchanged.\n</p> <a href=" +
//                     linkPasswdReset +
//                     ">Reset password</a></body>";

//                   sendemail.emailService(to, sub, content);
//                   res.json(
//                     "Please check you email for the reset password link"
//                   );
//                 })
//                 .catch(err => {
//                   console.log(err);
//                   errors.db = "Bad request";
//                   res.status(400).json(errors);
//                 });
//             }
//           })
//           .catch(err => {
//             console.log(err);
//             errors.db = "Bad request";
//             res.status(400).json(errors);
//           });
//       }
//     })
//     .catch(err => {
//       console.log(err);
//       errors.db = "Bad request";
//       res.status(400).json(errors);
//     });
// });

// router.get("/reset_password/:passwordToken", function(req, res) {
//   const { passwordToken } = req.params;

//   const { errors, isValid } = validatePasswordChange(req.body);

//   if (!isValid) {
//     return res.status(400).json(errors);
//   }
//   try {
//     let verify = jwt.verify(passwordToken, secretReturned, {
//       algorithms: ["RS256"],
//       issuer: "Cloudgiant enterprises"
//     });
//     console.log(verify);

//     if (verify.id.id.length) {
//       knex
//         .select(["email"])
//         .from("users")
//         .where({ id: verify.id.id, resettokenusedbefore: false })
//         .then(data => {
//           if (data.length > 0) {
//             bcrypt.genSalt(12, (err, salt) => {
//               if (err) throw err;
//               bcrypt.hash(req.body.password, salt, (err, hash) => {
//                 if (err) throw err;
//                 knex("users")
//                   .returning("email")
//                   .where({ id: verify.id.id, email: data[0].email })
//                   .update({ password: hash, resettokenusedbefore: true })
//                   .then(user => {
//                     if (user.length == 1) {
//                       let to = [user[0]];

//                       let sub = "Password change for your SimpleCode account.";
//                       let content =
//                         "<body><p>The password for your SimpleCode account has been successfully changed.</p> </body>";

//                       sendemail.emailService(to, sub, content);

//                       res.json(
//                         "Password successfully changed for " + user[0] + "!"
//                       );
//                     }
//                   })
//                   .catch(err => {
//                     errors.reset_password_failed =
//                       "Could not reset password, please try again";
//                     res.status(400).json(errors);
//                   });
//               });
//             });
//           } else {
//             errors.request_failed =
//               "Password reset error! Please go back to the forgot passwords page and re-enter your details.";
//             res.status(400).json(errors);
//           }
//         })
//         .catch(err => {
//           errors.server = "Bad request";
//           res.status(400).json(errors);
//         });
//     }
//   } catch (err) {
//     errors.invalid_token =
//       "Alert!! An unauthorized token sent a password reset request!";
//     res.status(400).json(errors);
//   }
// });
////////
// router.get("/account", loggedin.ensureLoggedIn(), ensureSecondFactor, function(
//   req,
//   res
// ) {
//   res.render("account", { user: req.user });
// });

router.get("/setup", loggedin.ensureLoggedIn(), function(req, res, next) {
  const { errors, isValid } = validateEmail(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  knex // need user id and email to be pass into req
    .table("users")
    .where("email", req.body.email)
    .select("key", "period")
    .then(obj => {
      if (obj) {
        let encodedKey = base32.encode(obj[0].key);
        let otpUrl =
          "otpauth://totp/" +
          req.body.email +
          "?secret=" +
          encodedKey +
          "&period=" +
          (obj[0].period || 30);
        let qrImage =
          "https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=" +
          encodeURIComponent(otpUrl);

        res.json({
          user: req.body,
          key: encodedKey,
          qrImage: qrImage
        });
      } else {
        let key = utils.randomKey(10);
        let encodedKey = base32.encode(key);

        let otpUrl =
          "otpauth://totp/" +
          req.body.email +
          "?secret=" +
          encodedKey +
          "&period=30";
        let qrImage =
          "https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=" +
          encodeURIComponent(otpUrl);

        knex
          .table("users")
          .where("id", req.body.id)
          .update({ key: key, period: 30 })
          .then(obj => {
            res.json({
              user: req.body,
              key: encodedKey,
              qrImage: qrImage
            });
          })
          .catch(err => {
            return next(err);
          });
      }
    })
    .catch(err => {
      return next(err);
    });
});

// router.get("/login", function(req, res) {
//   const { errors, isValid } = validateLoginInput(req.body);

//   if (!isValid) {
//     return res.status(400).json(errors);
//   }
//   res.json({ user: req.body, message: errors.message, error: errors });
// });

// router.post(
//   //passport.authenticate("jwt", { session: false }),
//   "/login",
//   jwtLogin,
//   tfaLogin
// );

router.post(
  "/login",
  passport.authenticate("jwt", jwtLogin, {
    successRedirect: "/login-otp",
    failureRedirect: "/login"
  }),
  function(req, res) {
    res.redirect("/");
  }
);

router.get(
  "/login-otp",
  loggedin.ensureLoggedIn(),
  function(req, res, next) {
    knex
      .table("users")
      .where("id", req.user.id)
      .select("key")
      .then(obj => {
        if (!obj) {
          return res.redirect("/setup");
        }
        return next();
      })
      .catch(err => {
        return next(err);
      });
  },
  function(req, res) {
    res.json({ user: req.body, message: errors.message, error: errors });
  }
);

router.post(
  "/login-otp",
  passport.authenticate("totp", {
    failureRedirect: "/login-otp",
    failureFlash: true
  }),
  function(req, res) {
    req.session.secondFactor = "totp";
    res.redirect("/");
  }
);

function ensureSecondFactor(req, res, next) {
  if (req.session.secondFactor == "totp") {
    return next();
  }
  res.redirect("/login-otp");
}

module.exports = router;
