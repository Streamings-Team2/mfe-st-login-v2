module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
      "^mfe_st_utils/(.*)$": "<rootDir>/__mocks__/mfe_st_utils/$1",
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  };