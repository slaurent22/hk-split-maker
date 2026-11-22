// Jest transformer for .txt & .lss files
// Similar to loaders/text-loader.js but for Jest
export default {
  process(sourceText) {
    return {
      code: `module.exports = ${JSON.stringify(sourceText)};`,
    };
  },
};
