module.exports = {
  extends: "erb",
  settings: {
    "import/resolver": {
      webpack: {
        config: require.resolve("./config/webpack.config.eslint.js")
      }
    }
  },
  rules: {
    // Basic errors
    "comma-dangle": [
      2,
      "never"
    ],
    "import/prefer-default-export": 0,

    // Variables
    "no-unused-vars": [
      2,
      {
        "vars": "local",
        "args": "after-used"
      }
    ],
    "no-use-before-define": 2,

    // Best practices
    "curly": [
      2,
      "multi-line"
    ],
    "default-case": 1,
    "no-else-return": 1,
    "no-fallthrough": 0,
    "no-param-reassign": 1,

    // Style formatting
    "camelcase": 1,
    "comma-spacing": [
      2,
      {
        "before": false,
        "after": true
      }
    ],
    "comma-style": [
      2,
      "last"
    ],
    "keyword-spacing": [
      2,
      {
        "before": true
      }
    ],
    "max-len": [
      2,
      128,
      {
        "ignoreComments": true,
        "ignoreStrings": true,
      	"tabWidth": 2
	    }
    ],
    "no-case-declarations": 0,
    "no-multiple-empty-lines": [
      2, {
        "max": 2
      }
    ],
    "no-nested-ternary": 2,
    "no-plusplus": 1,
    "no-trailing-spaces": 2,
    "no-underscore-dangle": 1,
    "prefer-destructuring": 1,
    "quotes": [
      2,
      "single",
      {
        "allowTemplateLiterals": true,
        "avoidEscape": true
      }
    ],
    "space-before-function-paren": [
      2,
      "never"
    ],
    "spaced-comment": 1,

    // React Specific
    "react/destructuring-assignment": 0,
    "react/forbid-prop-types": [2, {
      "forbid": [
        "any"
      ]
    }],
    "react/jsx-props-no-spreading": [2, {
      "custom": "ignore",
    }],

    // SORT
    "implicit-arrow-linebreak": [
      2,
      "beside"
    ],
    "multiline-ternary": [
      2,
      "never"
    ],
    "no-useless-concat": 2,
    "operator-linebreak": [
      2,
      "none"
    ],
  }
}
