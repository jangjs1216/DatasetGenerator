import { DragHandleIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import PlaceholderCard from '../components/common/PlaceholderCard';

const InsightsPage = () => {
  const border = useColorModeValue('gray.200', 'gray.700');

  return (
    <Stack spacing={6}>
      <Flex align="center" justify="space-between">
        <Heading size="lg">Insights</Heading>
        <Button leftIcon={<DragHandleIcon />} colorScheme="blue">
          Save InsightView
        </Button>
      </Flex>
      <Text color="gray.600">필터와 차트를 조합해 저장 가능한 InsightView를 구성합니다.</Text>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <PlaceholderCard
          title="필터 패널"
          description="태그/메타데이터/카테고리 필터를 설정하고 URL 쿼리로 동기화합니다."
        />
        <PlaceholderCard
          title="차트 보드"
          description="react-grid-layout을 사용해 바/파이/히스토그램/테이블 카드의 위치와 크기를 조정합니다."
        />
      </SimpleGrid>
      <Box borderWidth="1px" borderColor={border} p={4} borderRadius="md" bg="white">
        <Heading size="sm" mb={3}>
          저장 포맷
        </Heading>
        <Text fontSize="sm" color="gray.700">
          InsightView 저장 시 필터 DSL, 사용된 차트 타입/쿼리, 카드 배치 정보를 JSON으로 직렬화하여 API로 전송합니다.
        </Text>
      </Box>
    </Stack>
  );
};

export default InsightsPage;
