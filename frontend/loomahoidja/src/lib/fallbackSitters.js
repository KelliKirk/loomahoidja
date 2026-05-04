/** Kui API ei vasta, kasutame lo-fi andmeid (IDs ≥ 100 ei lähe backendisse). */
export const FALLBACK_SITTERS = [
  {
    id: 101,
    userId: 201,
    name: 'Leelo Lameuss',
    city: 'Tartu',
    hourlyRate: 8.5,
    bio: 'Kogenud hoidja, kes armastab nii koeri kui ka kasse.',
    animalTypes: ['dog', 'cat', 'bird'],
    photo: null,
    hasChildren: true,
    hasAnimals: false,
    rating: 4.9,
    reviewCount: 28,
    weekendsOk: true,
  },
  {
    id: 102,
    userId: 202,
    name: 'Rasmus Sigma',
    city: 'Tallinn',
    hourlyRate: 12,
    bio: 'Turvaline ja sõbralik keskkond Tallinna kesklinnas.',
    animalTypes: ['dog', 'cat'],
    photo: null,
    hasChildren: false,
    hasAnimals: true,
    rating: 4.8,
    reviewCount: 16,
    weekendsOk: true,
  },
  {
    id: 103,
    userId: 203,
    name: 'Sirli Sõber',
    city: 'Pärnu',
    hourlyRate: 9.25,
    bio: 'Pikad jalutuskäigud ja palju mänguaega.',
    animalTypes: ['dog'],
    photo: null,
    hasChildren: true,
    hasAnimals: true,
    rating: 4.7,
    reviewCount: 9,
    weekendsOk: true,
  },
]

export function fallbackSitterById(id) {
  const n = Number(id)
  return FALLBACK_SITTERS.find((s) => s.id === n) || null
}
