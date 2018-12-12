const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const TotpStrategy = require("passport-totp").Strategy;
const keys = require("../config/keys");
const knex = require("../knex");

const options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = keys.secretOrKey;

module.exports = passport => {
  // let INVALID_LOGIN = "Invalid username or password";

  // passport.serializeUser(function(user, done) {
  //   done(null, user.id);
  // });

  // passport.deserializeUser(function(id, done) {
  //   knex
  //     .tables("users")
  //     .where("id", id)
  //     .select("id",'key_tfa')
  //     .then(user => {
  //       if (user.length) {
  //         done(err, user);
  //       }
  //     })
  //     .catch(err => console.log(err));
  // });

  passport.use(
    new JwtStrategy(options, (payload, done) => {
      knex
        .select("id", "email", "registered")
        .from("users")
        .where({ id: payload.id, registered: payload.registered })
        .then(user => {
          if (user.length) {
            return done(null, user.id); //done?
          }
          return done(null, false);
        })
        .catch(err => console.log(err));
    })
  );

  // passport.use(
  //   new TotpStrategy(function(user, done) {
  //     // The user object carries all user related information, including
  //     // the shared-secret (key) and password.
  //     let key = user.key;
  //     if (!key) {
  //       return done(new Error("No Key"));
  //     } else {
  //       return done(null, base32.decode(key), 30); //30=valid key period
  //     }
  //   })
  // );
};
