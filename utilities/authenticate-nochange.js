const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const keys = require("../config/keys");
const knex = require("../knex");

const options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = keys.secretOrKey;

module.exports = passport => {
  passport.use(
    new JwtStrategy(options, (payload, done) => {
      knex
        .select("id", "email", "registered")
        .from("users")
        .where({ id: payload.id, registered: payload.registered })
        .then(user => {
          if (user.length) {
            return done(null, user); //done?
          }
          return done(null, false);
        })
        .catch(err => console.log(err));
    })
  );
};
