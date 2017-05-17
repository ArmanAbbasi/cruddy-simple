import { NotFoundError } from './';

describe('Utils', () => {
  describe('NotFoundError', () => {
    it('sets error name to NotFoundError', () => {
      const { name } = new NotFoundError();
      expect(name).toBe('NotFoundError');
    });

    it('sets default error message to Not Found', () => {
      const { message } = new NotFoundError();
      expect(message).toBe('Not Found');
    });

    it('sets instances to be of type Error', () => {
      const actual = new NotFoundError();
      expect(actual instanceof NotFoundError).toBeTruthy();
      expect(actual instanceof Error).toBeTruthy();
    });
  });
});
