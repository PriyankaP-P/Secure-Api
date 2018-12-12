const database = require("knex");

const knex = database({
  client: "pg",
  connection: {
    host: "127.0.0.1", //your local host ip
    user: "postgres", // your postgreSQL user name
    password: "*MxT194mZb", // your password
    database: "simplecode" // your database name
  }
});

module.exports = knex;
