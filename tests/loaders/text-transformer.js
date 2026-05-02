// Jest transformer for .txt & .lss files
// Similar to loaders/text-loader.js but for Jest
// eslint-disable-next-line no-undef
module.exports = {
  process(sourceText) {
    return {
      code: `module.exports = ${JSON.stringify(sourceText)};`,
    };
  },
};
