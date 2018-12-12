const { writeFileSync } = require("fs");
const { generateKeyPairSync } = require("crypto");

setInterval(function generate() {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "spki",
      format: "pem"
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem"
    }
  });

  writeFileSync("../private.pem", privateKey),
    writeFileSync("../public.pem", publicKey);
}, 60000 * 60 * 24);
