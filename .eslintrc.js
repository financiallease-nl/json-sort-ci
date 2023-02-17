/* eslint-disable */
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
  ],
  globals: {
    process: true,
      require: true,
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
      modules: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      alias: {
        map: [
          ["@", "./src"], //default @ -> ./src alias in Vue, it exists even if vue.config.js is not present
          /*
           *... add your own webpack aliases if you have them in vue.config.js/other webpack config file
           * if you forget to add them, eslint-plugin-import will not throw linting error in .vue imports that contain the webpack alias you forgot to add
           */
        ],
        extensions: [".ts", ".js", ".d.ts"],
      },
    },
  },
  plugins: ["sort-exports"],
  rules: {
    "no-trailing-spaces": ["error"],
    // Sometimes we are just bound to any's. Not a biggie, so
    // let's not get annoyed. We know what we are doing ¯\_(ツ)_/¯
    quotes: ["error", "double"],
    // Disallow multiple spaces
    "no-multi-spaces": ["error"],
    // Do nopt force newlines in curly brackets, but make sure that the use is consistent
    "object-curly-newline": [
      "error",
      {
        consistent: true,
      },
    ],
    // Always have a dangling comma at the end of arrays and objects
    "comma-dangle": ["error", "always-multiline"],
    // Always have spaces within curly brackets
    "object-curly-spacing": ["error", "always"],
    // End statements with semicolons
    semi: ["error", "always"],
    // sort imports and exports
    "sort-imports": [
      "error",
      {
        ignoreCase: false,
        ignoreDeclarationSort: false,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ["single", "all", "multiple", "none"],
      },
    ],
    "sort-exports/sort-exports": [
      "error",
      {
        sortDir: "asc",
        ignoreCase: true,
        sortExportKindFirst: "type",
      },
    ],
    "indent": ["error", 4, { "SwitchCase": 1}],
    // No console logs
    "no-console": ["error", { allow: ["warn", "error"] }],
    // UPPER CASE enum values
    "no-multiple-empty-lines": [
      "error",
      {
        max: 2,
        maxEOF: 1,
      },
    ]
  }
};
