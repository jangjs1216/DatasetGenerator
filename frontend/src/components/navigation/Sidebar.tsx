import { Box, Flex, Icon, Link, Text, Tooltip, VStack, useColorMode } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { AtSignIcon, CalendarIcon, CopyIcon, ViewIcon } from '@chakra-ui/icons';

const navItems = [
  { label: 'Projects', to: '/projects', icon: ViewIcon },
  { label: 'Assets', to: '/projects/:projectId/assets', icon: CalendarIcon },
  { label: 'Insights', to: '/projects/:projectId/insights', icon: AtSignIcon },
  { label: 'Exports', to: '/projects/:projectId/exports', icon: CopyIcon },
];

const Sidebar = () => {
  const { colorMode } = useColorMode();

  return (
    <Box
      as="nav"
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="100vh"
      borderRightWidth="1px"
      bg={colorMode === 'light' ? 'white' : 'gray.800'}
      p={4}
    >
      <Text fontWeight="bold" mb={6} px={3}>
        Navigation
      </Text>
      <VStack align="stretch" spacing={2}>
        {navItems.map((item) => (
          <Tooltip key={item.to} label={item.label} placement="right">
            <Link
              as={NavLink}
              to={item.to}
              px={3}
              py={2}
              borderRadius="md"
              _activeLink={{ bg: 'blue.500', color: 'white' }}
              _hover={{ textDecoration: 'none', bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
            >
              <Flex align="center" gap={2}>
                <Icon as={item.icon} />
                <Text>{item.label}</Text>
              </Flex>
            </Link>
          </Tooltip>
        ))}
      </VStack>
    </Box>
  );
};

export default Sidebar;
