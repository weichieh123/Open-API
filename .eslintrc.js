module.exports = {
    root: true,
    env: {
      node: true,
    },
    extends: ["plugin:vue/essential", "eslint:recommended"],
    // extends: ["plugin:vue/essential", "eslint:recommended", "@vue/prettier"],
    parser: "vue-eslint-parser",
    // parser: "babel-eslint",
    parserOptions: {
      parser: "babel-eslint",
    },
    rules: {
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
      // "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  };