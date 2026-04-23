module.exports = {
  testEnvironment: 'node',
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.js'],
  testMatch: ['<rootDir>/test/**/*.test.js'],
};

