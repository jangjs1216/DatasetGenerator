import { Flex, Heading, IconButton, Spacer, Tooltip } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useColorMode } from '@chakra-ui/react';

interface HeaderBarProps {
  onToggleTheme: () => void;
}

const HeaderBar = ({ onToggleTheme }: HeaderBarProps) => {
  const { colorMode } = useColorMode();

  return (
    <Flex
      as="header"
      align="center"
      gap={4}
      px={6}
      py={3}
      borderBottomWidth="1px"
      bg={colorMode === 'light' ? 'white' : 'gray.800'}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Heading size="md">DatasetGenerator</Heading>
      <Spacer />
      <Tooltip label="Toggle theme">
        <IconButton
          aria-label="toggle color mode"
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          onClick={onToggleTheme}
          variant="ghost"
        />
      </Tooltip>
    </Flex>
  );
};

export default HeaderBar;
