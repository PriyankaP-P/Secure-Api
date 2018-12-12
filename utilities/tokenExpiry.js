const knex = require("../knex");

setInterval(async function checkRegistrationTokenValidity() {
  await knex
    .select("id", "createdtime")
    .from("users")
    .then(timeOfTokenCreation => {
      timeOfTokenCreation.map(entryTime => {
        let timeInInt = parseInt(entryTime.createdtime);

        if (Date.now() > timeInInt + 60000 * 60) {
          knex
            .table("users")
            .where("id", entryTime.id)
            .update({ token: null })
            .then(res => res)
            .catch(err => err);
        }
      });
    })
    .catch(err => console.log(err));
}, 4000);

setInterval(async function checkPasswordTokenValidity() {
  await knex
    .select("id", "resetpasswordexpires")
    .from("users")
    .then(tokenExpiry => {
      if (tokenExpiry) {
        tokenExpiry.map(resetTime => {
          let timeInInt = parseInt(resetTime.resetpasswordexpires);
          if (Date.now() > timeInInt + 60000 * 60) {
            knex
              .table("users")
              .where("id", resetTime.id)
              .update({ resetpasswordtoken: null })
              .then(res => res)
              .catch(err => err);
          }
        });
      }
    })
    .catch(err => console.log(err));
}, 6000);
