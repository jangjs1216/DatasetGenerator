import { Box, Flex, useColorMode } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import HeaderBar from '../components/navigation/HeaderBar';
import Sidebar from '../components/navigation/Sidebar';

const RootLayout = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex minH="100vh" bg={colorMode === 'light' ? 'gray.50' : 'gray.900'}>
      <Sidebar />
      <Box flex="1" pl={{ base: 0, md: 60 }}>
        <HeaderBar onToggleTheme={toggleColorMode} />
        <Box as="main" p={6}>
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};

export default RootLayout;
