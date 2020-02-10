module.exports = config => {
    config.set({
        frameworks: ['mocha', 'karma-typescript'],

        files: [{ pattern: 'src/**/*.ts' }, { pattern: 'test/**/*.ts' }],

        plugins: [
            'karma-mocha',
            'karma-firefox-launcher',
            'karma-chrome-launcher',
            'karma-typescript'
        ],

        preprocessors: {
            '**/*.ts': ['karma-typescript']
        },

        reporters: ['dots', 'karma-typescript'],

        browsers: ['FirefoxHeadless', 'ChromeHeadless'],

        coverageReporter: {
            dir: 'coverage/',
            reporters: [{ type: 'html' }, { type: 'json' }]
        },

        karmaTypescriptConfig: {
            reports: {
                text: null,
                html: 'coverage',
                json: 'coverage'
            },
            coverageOptions: {
                exclude: /^test\//
            }
        },

        singleRun: true
    });
};
