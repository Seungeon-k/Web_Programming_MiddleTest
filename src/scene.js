export const CAST = [
  { id: 'giroro', name: 'ギロロ', korean: '기로로', rank: '伍長', role: '전투의 스페셜리스트', color: '#d94558', delay: 900, quote: '작전 개시다. 방심하지 마라!', description: '불같은 성격과 뜨거운 의리. 언제나 진지하게 임무에 임하는 케로로 소대의 전투 담당입니다.', symbol: '✚' },
  { id: 'tamama', name: 'タママ', korean: '타마마', rank: '二等兵', role: '귀여움 뒤의 반전', color: '#4899d3', delay: 1450, quote: '타마마, 출동하겠습니다~!', description: '반짝이는 눈망울과 달콤한 간식을 사랑하는 소대의 막내. 귀여운 모습 속에 엄청난 힘을 숨기고 있습니다.', symbol: '♡' },
  { id: 'kururu', name: 'クルル', korean: '쿠루루', rank: '曹長', role: '천재적인 트러블메이커', color: '#e8b925', delay: 2000, quote: '크크크… 재미있어지겠는데?', description: '호기심을 자극하는 발명과 예측할 수 없는 작전. 소대의 모든 기술 뒤에는 쿠루루의 천재적인 두뇌가 있습니다.', symbol: '◎' },
  { id: 'dororo', name: 'ドロロ', korean: '도로로', rank: '兵長', role: '바람처럼 나타나는 닌자', color: '#577bc5', delay: 2550, quote: '소인도… 여기 있소이다!', description: '조용하고 다정한 마음의 닌자. 자연을 사랑하며, 눈에 띄지 않는 곳에서도 동료들을 지키고 있습니다.', symbol: '✧' },
  { id: 'keroro', name: 'ケロロ', korean: '케로로', rank: '軍曹', role: '우리의 유쾌한 소대장', color: '#67a946', delay: 3100, quote: '지구 정복, 시작하는 것입니다!', description: '지구 정복을 꿈꾸지만 프라모델이 더 좋은 소대장. 엉뚱함과 사랑스러움으로 오늘도 모두를 웃게 만듭니다.', symbol: '★' },
];

export const TIMING = Object.freeze({ flight: 1250, title: 4580, titleDuration: 1000, total: 6100 });
export const launchTransform = (origin, target) => ({ x: origin.x - target.x, y: origin.y - target.y });
