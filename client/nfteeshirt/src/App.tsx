import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import { Box, Center, ChakraProvider, Image } from '@chakra-ui/react';
import { DAppProvider, ChainId, Polygon, Mumbai } from '@usedapp/core';

const config = {
  readOnlyChainId: Polygon.chainId,
  readOnlyUrls: {
    [Polygon.chainId]: process.env.REACT_APP_POLYGON_INFURA_URL ?? '',
  },
}

function App() {
  return (
    <ChakraProvider>
      <DAppProvider config={config}>
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      </DAppProvider>
    </ChakraProvider>
  );
}

export default App;
