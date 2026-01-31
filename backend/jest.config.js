/**
 * Jest Configuration for AlumniVerse Backend
 */

module.exports = {
    // Test environment
    testEnvironment: 'node',

    // Test match patterns
    testMatch: [
        '**/__tests__/**/*.test.js',
        '**/__tests__/**/*.spec.js'
    ],

    // Coverage configuration
    collectCoverageFrom: [
        'controllers/**/*.js',
        'middlewares/**/*.js',
        'utils/**/*.js',
        '!**/node_modules/**'
    ],

    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 30,
            functions: 40,
            lines: 40,
            statements: 40
        }
    },

    // Setup files
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],

    // Module paths
    moduleDirectories: ['node_modules', '<rootDir>'],

    // Verbose output
    verbose: true,

    // Timeout for tests
    testTimeout: 10000,

    // Clear mocks between tests
    clearMocks: true,

    // Restore mocks after each test
    restoreMocks: true
};
