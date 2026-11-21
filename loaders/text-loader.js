module.exports = function (source) {
  // const sourceLines = source.split("\n");
  // const splitString = sourceLines.map(line => {
  //     return `"${line}\n"`;
  // }).join("+");
  return `export default ${JSON.stringify(source)};`;
};
