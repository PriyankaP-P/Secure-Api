const express = require("express");
const router = express.Router();
const knex = require("knex");
const passport = require("passport");

router.get(
  "/", //inside Headers: add Authorization and add JWT + token???
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    knex
      .table("profile")
      .where("userID", req.user.id) // pass in user id here
      .insert("name", "username")
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => {
        errors.profile = "There are no profiles";
        res.status(404).json(errors);
      });
  }
);
