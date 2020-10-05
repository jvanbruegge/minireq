const debug = process.env.DEBUG === '1';

module.exports = config => {
    config.set({
        basePath: '..',

        frameworks: ['mocha', 'karma-typescript'],

        files: [
            { pattern: 'browser/src/**/*.ts' },
            { pattern: '{.,browser}/test/**.ts' },
        ],

        plugins: [
            'karma-mocha',
            'karma-firefox-launcher',
            'karma-chrome-launcher',
            'karma-typescript',
        ],

        preprocessors: {
            '**/*.ts': ['karma-typescript'],
        },

        reporters: ['dots', 'karma-typescript'],

        browsers: debug ? ['Chrome'] : ['FirefoxHeadless', 'ChromeHeadless'],
        concurrency: 1,

        karmaTypescriptConfig: {
            reports: {
                text: null,
                html: 'coverage',
                json: { directory: 'coverage', filename: 'coverage.json' },
            },
            coverageOptions: {
                exclude: /^test\//,
            },
        },

        singleRun: !debug,
    });
};
