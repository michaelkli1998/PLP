module.exports = {
    root: true,
    parser: 'babel-eslint',
    ignorePatterns: [
        'vendor/**/*',
    ],
    rules: {
        semi: 'warn',
        eqeqeq: 'warn',
        'max-len': [
            'warn',
            {
                code: 140,
                ignoreUrls: true,
                ignoreStrings: true,
                ignoreComments: true,
                ignoreTrailingComments: true,
                ignoreTemplateLiterals: true,
            },
        ],
        'eol-last': ['warn', 'always'],
        indent: [
            'warn',
            4,
            {
                VariableDeclarator: 'first',
                flatTernaryExpressions: true,
            },
        ],
        'spaced-comment': ['warn', 'always'],
        curly: ['warn', 'all'],
        'brace-style': [
            'warn',
            '1tbs',
            {
                allowSingleLine: true,
            },
        ],
        quotes: [
            'warn',
            'single',
            {
                allowTemplateLiterals: true,
            },
        ],
        'object-curly-spacing': [
            'warn',
            'always',
            {
                arraysInObjects: false,
            },
        ],
        'prefer-const': 'warn',
        'no-debugger': 'error',
        'no-unreachable': 'error',
        'no-dupe-keys': 'warn',
        'no-duplicate-case': 'warn',
        'no-duplicate-imports': 'error',
        'no-regex-spaces': 'warn',
        'no-fallthrough': 'error',
        'no-var': 'error',
        'no-unused-expressions': 'warn',
        'no-trailing-spaces': 'off',
        'no-multiple-empty-lines': [
            'warn',
            {
                max: 1,
                maxBOF: 0,
                maxEOF: 1,
            },
        ],
        'sort-imports': [
            'warn',
            {
                ignoreCase: true,
                allowSeparatedGroups: true,
                memberSyntaxSortOrder: ['none', 'all', 'single', 'multiple'],
            },
        ],
    },
};
