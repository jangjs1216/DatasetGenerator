import { Box, Heading, Text } from '@chakra-ui/react';

interface PlaceholderCardProps {
  title: string;
  description: string;
}

const PlaceholderCard = ({ title, description }: PlaceholderCardProps) => (
  <Box
    borderWidth="1px"
    borderRadius="lg"
    p={6}
    bg="white"
    boxShadow="sm"
    minH="180px"
    display="flex"
    flexDirection="column"
    gap={3}
  >
    <Heading size="md">{title}</Heading>
    <Text color="gray.600">{description}</Text>
  </Box>
);

export default PlaceholderCard;
