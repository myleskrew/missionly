module.exports = function handler(req, res) {
  res.json({ hello: 'world', node: process.version });
};
