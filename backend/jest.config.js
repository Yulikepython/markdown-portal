// jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // *.test.ts を拾う設定
    testMatch: [
        '**/test/**/*.test.ts',
        '**/?(*.)+(spec|test).ts'
    ],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/'
    ],
};
