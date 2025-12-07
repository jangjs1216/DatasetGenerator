import { EditIcon } from '@chakra-ui/icons';
import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import PlaceholderCard from '../components/common/PlaceholderCard';

const AssetsPage = () => {
  const border = useColorModeValue('gray.200', 'gray.700');

  return (
    <Stack spacing={6}>
      <Flex justify="space-between" align="center">
        <Heading size="lg">Assets</Heading>
        <HStack spacing={3}>
          <Button variant="outline">Bulk Edit</Button>
          <Button leftIcon={<EditIcon />} colorScheme="blue">
            Edit Filters
          </Button>
        </HStack>
      </Flex>
      <Text color="gray.600">태그/메타데이터 필터로 에셋을 조회하고 인라인 편집을 테스트할 수 있는 뷰입니다.</Text>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <PlaceholderCard
          title="썸네일 그리드"
          description="가상 스크롤 그리드로 썸네일, 태그, 카테고리 정보를 보여주고 다중 선택을 제공합니다."
        />
        <PlaceholderCard
          title="테이블 뷰"
          description="정렬/필터가 반영된 테이블 뷰를 만들고, 셀 편집으로 태그/메타데이터를 변경합니다."
        />
      </SimpleGrid>
      <Box borderWidth="1px" borderColor={border} p={4} borderRadius="md" bg="white">
        <Heading size="sm" mb={3}>
          필터 DSL 예시
        </Heading>
        <Stack spacing={2}>
          <Badge colorScheme="blue">tag:car width>1024 metadata.color:red</Badge>
          <Badge colorScheme="green">category:person has:segmentation area>4096</Badge>
          <Badge colorScheme="purple">date:2024-12-01..2024-12-31</Badge>
        </Stack>
      </Box>
      <Box borderWidth="1px" borderColor={border} p={4} borderRadius="md" bg="white">
        <Heading size="sm" mb={3}>
          예상 인터랙션
        </Heading>
        <Stack spacing={2}>
          <Text>· 썸네일 선택 후 태그 추가/제거</Text>
          <Text>· 메타데이터 Key/Value 인라인 수정</Text>
          <Text>· 선택 항목을 CVAT Export/재업로드로 전달</Text>
        </Stack>
      </Box>
    </Stack>
  );
};

export default AssetsPage;
