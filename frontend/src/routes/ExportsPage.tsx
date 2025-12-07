import { RepeatIcon } from '@chakra-ui/icons';
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import PlaceholderCard from '../components/common/PlaceholderCard';

const ExportsPage = () => {
  return (
    <Stack spacing={6}>
      <Flex align="center" justify="space-between">
        <Heading size="lg">Exports</Heading>
        <Button leftIcon={<RepeatIcon />} colorScheme="blue">
          Trigger Export
        </Button>
      </Flex>
      <Text color="gray.600">CVAT 태스크 재생성을 위한 ExportJob을 확인하고 재시도/다운로드합니다.</Text>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <PlaceholderCard
          title="ExportJob 리스트"
          description="Job ID, 상태, 진행률, CVAT 태스크 링크/재시도를 표시하는 테이블을 추가하세요."
        />
        <PlaceholderCard
          title="히스토리"
          description="최근 성공/실패 내역과 사용자/필터 스냅샷 정보를 보여줍니다."
        />
      </SimpleGrid>
      <Box borderWidth="1px" borderColor="gray.200" p={4} borderRadius="md" bg="white">
        <Heading size="sm" mb={3}>
          상태 태그
        </Heading>
        <Stack direction="row" spacing={2} wrap="wrap">
          <Badge colorScheme="blue">PENDING</Badge>
          <Badge colorScheme="yellow">RUNNING</Badge>
          <Badge colorScheme="green">SUCCEEDED</Badge>
          <Badge colorScheme="red">FAILED</Badge>
        </Stack>
      </Box>
    </Stack>
  );
};

export default ExportsPage;
