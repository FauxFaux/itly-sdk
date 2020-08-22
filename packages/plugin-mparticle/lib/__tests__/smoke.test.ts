
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require, import/no-unresolved, import/extensions */
import { requireForTestEnv } from '../../../../__tests__/util';

const MparticleBrowserPlugin = requireForTestEnv(__dirname);

let itly: any;

beforeEach(() => {
  jest.resetModules();

  itly = require('@itly/sdk').default;
});

afterEach(() => {
  itly = undefined;
});

test('should not crash on load', () => {
  const mparticleBrowserPlugin = new MparticleBrowserPlugin();

  expect(() => {
    itly.load({
      environment: 'production',
      plugins: [mparticleBrowserPlugin],
    });
  }).not.toThrow();
});
