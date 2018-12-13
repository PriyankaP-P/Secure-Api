const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const TotpStrategy = require("passport-totp").Strategy;
const keys = require("../config/keys");
const knex = require("../knex");

const options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = keys.secretOrKey;

module.exports = function(passport) {
  let INVALID_LOGIN = "Invalid username or password";

  // passport.serializeUser(function(user, done) {
  //   done(null, user.id);
  // });

  // passport.deserializeUser(function(id, done) {
  //   let error = {};
  //   console.log(arguments.callee.caller);
  //   knex("users")
  //     .where("id", id)
  //     .select("id", "key")
  //     .then(info => {
  //       if (info.length) {
  //         done(error, info);
  //       }
  //     })
  //     .catch(err => console.log(err));
  // });
  passport.use(
    new JwtStrategy(options, function(payload, done) {
      console.log(payload);
      process.nextTick(function() {
        knex
          .table("users")
          .select("id", "email", "registered")
          .where({ id: payload.id, registered: payload.registered })

          .then(user => {
            if (user.length) {
              return done(null, user[0]);
            }
            return done(null, false);
          })
          .catch(err => {
            console.log(err);
            return done(null, false, { message: "Incorrect credentials." });
          });
      });
    })
  );

  passport.use(
    new TotpStrategy(function(user, done) {
      // The user object carries all user related information, including
      // the shared-secret (key) and password.
      console.log(`from totp strategy ${user}`);

      knex("users")
        .where("id", user.id)
        .select("key")
        .then(theKey => {
          console.log(theKey);
          if (!theKey) {
            return done(new Error("No Key"));
          } else {
            return done(null, base32.decode(theKey), 30); //30=valid key period
          }
        })
        .catch(err => {
          return err;
        });
    })
  );
};
