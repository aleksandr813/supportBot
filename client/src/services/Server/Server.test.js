import Server from './Server';
import Store from '../Store/Store';

jest.mock('socket.io-client', () => ({
  io: () => ({ on: jest.fn(), emit: jest.fn() }),
}));

function createServer() {
  const store = new Store();
  store.setUserParams('operator-guid', 'operator-token');
  const mediator = { call: jest.fn() };
  return new Server(mediator, store);
}

test('adding a bot sends both the operator session and the new bot\'s own token', () => {
  const server = createServer();

  server.addBot({ token: 'new-bot-token', address: 'localhost', port: '3004' });

  expect(server.socket.emit).toHaveBeenCalledWith('ADD_BOT', {
    token: 'new-bot-token',
    address: 'localhost',
    port: '3004',
    operatorGuid: 'operator-guid',
    operatorToken: 'operator-token',
  });
});

test('deleting a bot sends both the operator session and the target bot\'s own guid', () => {
  const server = createServer();

  server.deleteBot({ guid: 'bot-guid-to-delete' });

  expect(server.socket.emit).toHaveBeenCalledWith('DELETE_BOT', {
    guid: 'bot-guid-to-delete',
    operatorGuid: 'operator-guid',
    operatorToken: 'operator-token',
  });
});

test('updating a bot keeps its own guid/token separate from the operator session', () => {
  const server = createServer();

  server.updateBot({ guid: 'bot-guid', token: 'bot-token', address: 'localhost', port: '3004' });

  expect(server.socket.emit).toHaveBeenCalledWith('UPDATE_BOT', {
    guid: 'bot-guid',
    token: 'bot-token',
    address: 'localhost',
    port: '3004',
    operatorGuid: 'operator-guid',
    operatorToken: 'operator-token',
  });
});
