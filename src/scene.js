export const CAST = [
  { id: 'giroro', name: '기로로', color: '#d94558', delay: 900, reaction: 'recoil' },
  { id: 'tamama', name: '타마마', color: '#4899d3', delay: 1450, reaction: 'jump' },
  { id: 'kururu', name: '쿠루루', color: '#e8b925', delay: 2000, reaction: 'wobble' },
  { id: 'dororo', name: '도로로', color: '#577bc5', delay: 2550, reaction: 'dash' },
  { id: 'keroro', name: '케로로', color: '#67a946', delay: 3100, reaction: 'salute' },
];

export const TIMING = Object.freeze({ flight: 1250, punch: .56, title: 4580, titleDuration: 1000, total: 6100 });
export const launchTransform = (origin, target) => ({ x: origin.x - target.x, y: origin.y - target.y });
