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

// const QRCode = require("qrcode");

// let secret = speakeasy.generateSecret({ length: 20 });

// console.log(secret.base32);

// QRCode.toDataURL(secret.otpauth_url, function(err, image_data) {
//   console.log(image_data);
// });

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
// const knex = require("./knex");
// knex("users")
//   .where("id", "dcdbbb3e-9909-4e1a-8104-45768f282f5c")
//   .update("tfa_enabled", true)
//   .then(row => row)
//   .catch(err => err);
// const notp = require("notp");
// const base32 = require("thirty-two");
// const utils = require("./utilities/utils");

// let key = utils.randomKey(10);
// let encodedKey = base32.encode(key);
// console.log( key);
// console.log( encodedKey);
// let otpUrl =
//   "otpauth://totp/" +
//   "priyanka.phillips18@gmail.con" +
//   "?secret=" +
//   encodedKey +
//   "&period=30";
// let qrImage =
//   "https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=" +
//   encodeURIComponent(otpUrl);

// let key = "k5f3d1wzqr";
// let codeEntered = "133625";
// let a = base32.decode(codeEntered);
// // let check1 = base32.decode(codeEntered);

// let check = notp.totp.verify(key, codeEntered);
// console.log(check);
// // console.log(qrImage);
const notp = require("notp"),
  base32 = require("thirty-two"),
  K = "gnbxjbwj5s", //"12345678901234567890",
  b32 = base32.encode(K);

console.log(
  "Click on this link to gennerate a QR code, and use Google Authenticator on your phone to read it:"
);
console.log(
  "http://qrcode.kaywa.com/img.php?s=8&d=" +
    encodeURIComponent("otpauth://totp/notp@example.com?secret=" + b32)
);
verify();

function verify() {
  ask("Enter a code to verify", function(code) {
    if (notp.totp.verify(code, K, {})) {
      console.log("Success!!!");
    }
    console.log(notp.totp.verify(code, K, {}));
    verify();
  });
}

function ask(question, callback) {
  let stdin = process.stdin,
    stdout = process.stdout;

  stdin.resume();
  stdout.write(question + ": ");

  stdin.once("data", function(data) {
    data = data.toString().trim();
    callback(data);
  });
}
