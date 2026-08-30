import React, { useRef } from 'react';
import PageManager from './pages/PageManager';

import Server from './services/Server/Server';
import Store from './services/Store/Store';
import FileService from './services/FileService/FileService';

import useMediator from './services/Mediator/useMediator';

import './App.css';


export const MediatorContext = React.createContext(null);
export const ServerContext = React.createContext(null);
export const FileServiceContext = React.createContext(null);

function App() {
  const mediator = useMediator();

  const storeRef = useRef(null);
  const fileServiceRef = useRef(null);
  const serverRef = useRef(null);

  if (!storeRef.current) storeRef.current = new Store();
  if (!fileServiceRef.current) fileServiceRef.current = new FileService();
  if (!serverRef.current) serverRef.current = new Server(mediator, storeRef.current);

  const server = serverRef.current;
  const fileService = fileServiceRef.current;

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