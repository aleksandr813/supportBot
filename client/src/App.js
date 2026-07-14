import React from 'react';
import logo from './logo.svg';
import PageManager from './pages/PageManager';

import Mediator from './services/Mediator/Mediator';
import Server from './services/Server/Server';
import Store from './services/Store/Store';
import FileService from './services/FileService/FileService';

import useMediator from './services/Mediator/useMediator';

import './App.css';


export const MediatorContext = React.createContext(null);
export const ServerContext = React.createContext(null);
export const FileServiceContext = React.createContext(null);

function App() {
  const store = new Store();
  const mediator = useMediator();
  const server = new Server(mediator, store);
  const fileService = new FileService();

  return (
    <div className="App">
      <MediatorContext value={mediator}>
        <ServerContext value={server}>
          <FileServiceContext value={fileService}>
            <div className='app'>
              <PageManager />
            </div>
          </FileServiceContext>
        </ServerContext>
      </MediatorContext>
    </div>
  );
}

export default App;