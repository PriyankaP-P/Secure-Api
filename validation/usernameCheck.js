const knex = require("../knex");

function sameUsername(username) {
  let sendName;
  knex
    .table("users")
    .where("username", username)
    .select("username")
    .then(result => {
      if (result.length) {
        sendName = username;
        return sendName;
      }
    })
    .catch(err => console.log(err));

  return sendName;
}

module.exports = sameUsername;

function sameUsername(username) {
  let same = false;
  knex
    .table("users")
    .pluck("username")
    .then(result => {
      if (result.length) {
        result.forEach(element => {
          if (element == username) {
            same = true;
            return same;
          }
        });
      }
    })
    .catch(err => console.log(err));
  return same;
}
