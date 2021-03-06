exports.randomKey = function(len) {
  let buf = [],
    chars = "abcdefghijklmnopqrstuvwxyz0123456789",
    charlen = chars.length;

  for (let i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }

  return buf.join("");
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
