module.exports = {
  roots: ['<rootDir>'],
  testEnvironment: 'jsdom',
  setupFiles: ['jsdom-worker'],
  testPathIgnorePatterns: ['<rootDir>/__tests__/factories'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
