import React from 'react';
import TableComponent from './components/TableComponent';
import { MantineProvider } from '@mantine/core';

const App = () => {
  return (
   <MantineProvider>
        <div>
          <TableComponent />
        </div>
    </MantineProvider>
  );
};

export default App;
