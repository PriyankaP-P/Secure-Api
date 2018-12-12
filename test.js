// const jwt = require("jsonwebtoken");
// const fs = require("fs");
// let path = require("path");
// let filePathPriv = path.join(__dirname, "../private.pem");
// const secret = fs.readFileSync(filePathPriv, { encoding: "utf-8" });

// // const secret = fs.readFileSync("./private.pem");

// let payload = { id: "b08f86af-35da-48f2-8fab-cef3904660bd" };
// let a = jwt.sign(payload, secret, {
//   expiresIn: 60000 * 30,
//   issuer: "Cloudgiant enterprises",
//   algorithm: "RS256"
// });
// console.log(a);
// let filePathPub = path.join(__dirname, "../public.pem");
// let pub = fs.readFileSync(filePathPub, { encoding: "utf-8" });
// // let pub = fs.readFileSync("public.pem");

// let r = jwt.verify(a, pub, {
//   algorithms: ["RS256"],
//   issuer: "Cloudgiant enterprises"
// });
// console.log(r);
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

let secret = speakeasy.generateSecret({ length: 20 });

console.log(secret.base32);

QRCode.toDataURL(secret.otpauth_url, function(err, image_data) {
  console.log(image_data);
});

// QRCode.toFile(
//   "./qrcode.png",
//   "sample test",
//   {
//     color: {
//       dark: "#000000",
//       light: "#FFFAFA"
//     }
//   },
//   function(err) {
//     if (err) throw err;
//     console.log("done");
//   }
// );
// QRCode.toString("http://www.google.com", function(err, string) {
//   if (err) throw err;
//   console.log(string);
// });
