import { AddIcon, RepeatIcon } from '@chakra-ui/icons';
import { Button, Flex, Heading, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import PlaceholderCard from '../components/common/PlaceholderCard';

const ProjectsPage = () => {
  return (
    <VStack align="stretch" spacing={6}>
      <Flex align="center" justify="space-between">
        <Heading size="lg">Projects</Heading>
        <HStack spacing={3}>
          <Button leftIcon={<RepeatIcon />} variant="ghost">
            Refresh
          </Button>
          <Button colorScheme="blue" leftIcon={<AddIcon />}>Create Project</Button>
        </HStack>
      </Flex>
      <Text color="gray.600">CVAT COCO 업로드로 생성된 프로젝트를 관리하고 진입합니다.</Text>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        <PlaceholderCard
          title="프로젝트 카드"
          description="프로젝트 이름, 최근 업로드, 진행 중인 업로드/Export 상태를 보여주는 카드를 배치합니다."
        />
        <PlaceholderCard
          title="COCO 업로드"
          description="COCO JSON/이미지 ZIP 업로드 모달을 연결하고, 업로드 후 프로젝트가 생성되도록 합니다."
        />
        <PlaceholderCard
          title="검색/필터"
          description="프로젝트 명/태그 기반 검색 및 정렬 UI를 구성하세요."
        />
      </SimpleGrid>
    </VStack>
  );
};

export default ProjectsPage;
