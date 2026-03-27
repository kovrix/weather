module.exports = function babelConfig(api) {
  // Keep Babel config caching stable for Metro/Expo bundling.
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      function importMetaCompatPlugin({ types: t }) {
        return {
          name: "import-meta-compat-plugin",
          visitor: {
            MemberExpression(path) {
              const object = path.node.object;
              if (
                object &&
                object.type === "MetaProperty" &&
                object.meta.name === "import" &&
                object.property.name === "meta"
              ) {
                path.replaceWith(t.identifier("undefined"));
              }
            },
            MetaProperty(path) {
              if (
                path.node.meta.name === "import" &&
                path.node.property.name === "meta"
              ) {
                path.replaceWith(t.objectExpression([]));
              }
            },
          },
        };
      },
    ],
  };
};
