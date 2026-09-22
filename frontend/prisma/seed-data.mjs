/*
 * The seeded catalogue: what `npm run db:seed` writes, and what the app reads
 * directly when no DATABASE_URL is set (lib/catalogue/list.ts). Plain data,
 * no Prisma, so both can import it.
 */

/* The paper card, plus last-resort CITY / SPORTS fallbacks. The dynamic stories
   come from ingestion (lib/news/ingest.ts); these are inactive so they only
   show when nothing has been ingested. Mirrored in lib/news/home.ts. */
export const news = [
  {
    title: 'Prabhat Khabar today',
    description: 'अख़बार नहीं, आंदोलन।',
    image: '/gandhi-maidan.jpg',
    link: 'https://epaper.prabhatkhabar.com/',
    type: 'NEWSPAPER',
    category: 'newspaper',
    sourceName: 'Prabhat Khabar',
    sourceDomain: 'prabhatkhabar.com'
  },
  {
    title: "Patna Pustak Mela '25",
    description: 'Gandhi Maidan filled with books again. This year was great!',
    image: '/gandhi-maidan.jpg',
    link: 'https://patnabookfair.com/',
    type: 'CITY',
    category: 'culture',
    eventSlug: 'patna-book-fair',
    isActive: false
  },
  {
    title: 'Patna Pirates at home',
    description: 'Three-time champions. Catch the raid at Patliputra Sports Complex this weekend.',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
    link: 'https://www.prokabaddi.com/teams/patna-pirates-profile-6',
    type: 'SPORTS',
    category: 'kabaddi',
    isActive: false
  }
]

export const marketplace = [
  {
    title: "Bhagalpuri Tussar silk - Bihar's pride.",
    location: 'Nathnagar, Bhagalpur',
    price: '₹2,500 onwards',
    image: '/madhubani-artist.jpg',
    link: 'https://www.bharatsthali.com/bhagalpuri-silk-sarees'
  },
  {
    title: 'Silao Khaja - GI-tagged, sixty layers thin.',
    location: 'Silao, Nalanda',
    price: '₹30 onwards',
    image: '/khaja.jpg',
    link: 'https://en.wikipedia.org/wiki/Silao_Khaja'
  },
  {
    title: 'Madhubani on paper - straight from the painter.',
    location: 'Jitwarpur, Madhubani',
    price: '₹499 onwards',
    image: '/madhubani.jpg',
    link: 'https://www.gaatha.com/category/madhubani-paintings/'
  }
]

export const places = [
  { slug: 'bansi-vihar-fraser-road', name: 'Bansi Vihar', type: 'Food', location: 'Fraser Road', area: 'Fraser Road', address: 'Fraser Road, Patna', latitude: 25.610760, longitude: 85.138150, tags: ['restaurant', 'vegetarian', 'thali'], description: 'Patna institution since 1942, for a proper vegetarian thali and litti.', image: '/litti.jpg', rating: 4.3, status: 'Open now', sourceConfidence: 0.9 },
  { name: 'Maurya Lok', type: 'Food', location: 'Dak Bungalow Chowk', description: 'The old shopping complex where the city eats litti chokha and chaat standing up.', image: '/litti.jpg', rating: 4.2, status: 'Open now' },
  { slug: 'cafe-hideout-boring-road', name: 'Café Hideout', type: 'Cafe', location: 'Boring Road', area: 'Boring Road', address: 'Boring Road, Patna', latitude: 25.619900, longitude: 85.106900, tags: ['cafe', 'coffee', 'students'], description: 'The Boring Road café where half the coaching batch goes after class.', image: '/ganga-ghat.jpg', rating: 4.3, status: 'Open now', sourceConfidence: 0.8 },
  { slug: 'golghar', name: 'Golghar', type: 'Places', location: 'Gandhi Maidan', area: 'Gandhi Maidan', address: 'Golghar, Bankipur, Patna', latitude: 25.619700, longitude: 85.139400, tags: ['monument', 'heritage', 'viewpoint'], description: 'The 1786 granary. Climb the spiral for the Ganga and the whole of Patna.', image: '/golghar.jpg', rating: 4.6, status: 'Open now', sourceConfidence: 1 },
  { slug: 'mahatma-gandhi-setu', name: 'Mahatma Gandhi Setu', type: 'Places', location: 'Gaighat', area: 'Gaighat', address: 'Mahatma Gandhi Setu, Patna', latitude: 25.625400, longitude: 85.195600, tags: ['bridge', 'landmark', 'ganga'], description: 'Five and a half kilometres over the Ganga to Hajipur.', image: '/gandhi-setu.jpg', rating: 4.5, status: 'Open now', sourceConfidence: 1 },
  { slug: 'bihar-museum', name: 'Bihar Museum', type: 'Culture', location: 'Bailey Road', area: 'Bailey Road', address: 'Jawaharlal Nehru Marg, Patna', latitude: 25.607200, longitude: 85.120100, tags: ['museum', 'culture', 'didarganj'], description: 'The Didarganj Yakshi and everything Magadh made.', image: '/bihar-museum.jpg', rating: 4.7, status: 'Closes at 5 PM', sourceConfidence: 1 },
  { slug: 'patna-museum', name: 'Patna Museum', type: 'Culture', location: 'Buddha Marg', area: 'Buddha Marg', address: 'Buddha Marg, Patna', latitude: 25.610300, longitude: 85.136000, tags: ['museum', 'heritage', 'buddha relic'], description: "The 1917 Jadu Ghar, with a casket of the Buddha's relics.", image: '/patna-museum.jpg', rating: 4.4, status: 'Closes at 5 PM', sourceConfidence: 1 },
  { slug: 'takht-sri-patna-sahib', name: 'Takht Sri Patna Sahib', type: 'Culture', location: 'Patna City', area: 'Patna City', address: 'Harmandir Gali, Patna City', latitude: 25.601400, longitude: 85.231000, tags: ['gurudwara', 'heritage', 'langar'], description: 'Birthplace of Guru Gobind Singh, one of the five takhts of the Sikhs.', image: '/patna-sahib.jpg', rating: 4.8, status: 'Open now', sourceConfidence: 1 },
  { slug: 'mahabodhi-temple', name: 'Mahabodhi Temple', type: 'Places', location: 'Bodh Gaya', area: 'Bodh Gaya', address: 'Bodh Gaya, Gaya', latitude: 24.695900, longitude: 84.991400, tags: ['temple', 'unesco', 'buddhist'], description: 'Where the Buddha sat down under a tree. UNESCO World Heritage.', image: '/mahabodhi.jpg', rating: 4.9, status: 'Open now', sourceConfidence: 1 },
  { slug: 'nalanda-mahavihara', name: 'Nalanda Mahavihara', type: 'Places', location: 'Nalanda', area: 'Nalanda', address: 'Nalanda, Bihar', latitude: 25.135700, longitude: 85.443000, tags: ['ruins', 'unesco', 'university'], description: "The ruins of the world's first residential university, 5th century.", image: '/nalanda.jpg', rating: 4.8, status: 'Open now', sourceConfidence: 1 },
  { name: 'Rajgir', type: 'Hill Station', location: 'Nalanda', description: 'Hot springs, the ropeway to the Vishwa Shanti Stupa, and the Glass Bridge.', image: '/rajgir.jpg', rating: 4.6, status: 'Open now' },
  { name: 'Valmiki Tiger Reserve', type: 'Forest', location: 'West Champaran', description: "Bihar's only tiger reserve, along the Gandak at the foot of the Himalaya.", image: '/valmiki.jpg', rating: 4.5, status: 'Open now' },
  { name: 'Vikramshila', type: 'Places', location: 'Bhagalpur', description: 'The other great university of Pala Bihar, on the banks of the Ganga.', image: '/vikramshila.jpg', rating: 4.4, status: 'Open now' },
  { name: 'Kesaria Stupa', type: 'Places', location: 'East Champaran', description: 'The tallest stupa in the world, and one of the least visited.', image: '/kesaria.jpg', rating: 4.5, status: 'Open now' },
  { name: 'Barabar Caves', type: 'Places', location: 'Jehanabad', description: 'Ashoka-era caves cut into granite and polished like glass.', image: '/barabar.jpg', rating: 4.5, status: 'Open now' },
  { name: 'Ganga Ghats, Patna', type: 'Outdoors', location: 'Patna', description: 'The river walk from Gandhi Ghat to Digha, best at dusk.', image: '/ganga-ghat.jpg', rating: 4.4, status: 'Open now' }
]

export const exploreCategories = [
  { slug: 'cafes', name: 'Cafés', icon: 'coffee', sortOrder: 0 },
  { slug: 'food', name: 'Food', icon: 'food', sortOrder: 1 },
  { slug: 'places', name: 'Places', icon: 'place', sortOrder: 2 },
  { slug: 'culture', name: 'Culture', icon: 'culture', sortOrder: 3 },
  { slug: 'shopping', name: 'Shopping', icon: 'shopping', sortOrder: 4 },
  { slug: 'experiences', name: 'Experiences', icon: 'experience', sortOrder: 5 },
  { slug: 'outdoors', name: 'Outdoors', icon: 'outdoors', sortOrder: 6 },
]

export const placeCategoryByType = {
  Cafe: 'cafes',
  Food: 'food',
  Places: 'places',
  Culture: 'culture',
  Monument: 'places',
  Bridge: 'places',
  Museum: 'culture',
  'Hill Station': 'places',
  Forest: 'outdoors',
  Outdoors: 'outdoors',
  Beach: 'outdoors',
}

/* Chhath ghats: distances from Gandhi Maidan */
export const ghats = [
  { name: 'Gandhi Ghat', location: 'Patna', description: 'The main Patna ghat, under the NIT. The biggest Sandhya Arghya crowd in the state.', image: '/ganga-ghat.jpg', distance: '1.4 km', rating: 4.8 },
  { name: 'Collectorate Ghat', location: 'Patna', description: 'Old Patna: broad steps, boats for hire, and the Setu in the distance.', image: '/chhath-ghat.jpg', distance: '1.9 km', rating: 4.6 },
  { name: 'Digha Ghat', location: 'Digha, Patna', description: 'The west end of the river walk, with the JP Setu behind the sun.', image: '/digha-ghat.jpg', distance: '7.5 km', rating: 4.7 },
  { name: 'Kangan Ghat', location: 'Patna City', description: 'The Patna Sahib ghat. Ancient, quiet, and lit end to end on Chhath.', image: '/patna-sahib.jpg', distance: '11 km', rating: 4.5 }
]

export const regions = [
  { name: 'Magadh', description: 'Patna, Gaya, Bodh Gaya, Nalanda — the ghats and the ruins', image: '/nalanda.jpg' },
  { name: 'Mithila', description: 'Darbhanga, Madhubani — painted courtyards and makhana ponds', image: '/madhubani.jpg' },
  { name: 'Bhojpur', description: "Ara, Buxar, Sasaram — Bhojpuri song and Sher Shah's tomb", image: '/sasaram.jpg' },
  { name: 'Anga', description: 'Bhagalpur, Munger — silk, Vikramshila and the dolphins of the Ganga', image: '/vikramshila.jpg' },
]

export const communities = [
  { name: 'GDG Patna', description: 'Google Developer Group Patna - Tech community', link: 'https://gdg.community.dev/gdg-patna/', icon: 'FaMeetup' },
  { name: 'HackSlash NIT Patna', description: 'The NIT Patna developer community, open source and coding culture', link: 'https://hackslash.nitp.ac.in/', icon: 'FaMeetup' },
  { name: 'Patna se hai', description: 'City guides, culture, food and everyday Patna', link: 'https://www.instagram.com/patna_se_hai_/', icon: 'FaInstagram' },
  { name: 'Patna City', description: 'Exploring the old city, Patna Sahib and the ghats', link: 'https://www.instagram.com/patnacity_/', icon: 'FaInstagram' }
]

export const transport = [
  { category: 'auto', name: 'Gandhi Maidan Auto Stand', distance: '0.3 km', time: '2 mins' },
  { category: 'auto', name: 'Dak Bungalow Chowk', distance: '0.8 km', time: '5 mins' },
  { category: 'auto', name: 'Income Tax Golambar', distance: '1.2 km', time: '7 mins' },
  { category: 'bus', name: 'Gandhi Maidan Bus Stop', distance: '0.5 km', time: '5 mins', routes: ['Pink Bus', 'City Ride 1', 'BSRTC 6'] },
  { category: 'bus', name: 'Patna Junction Bus Stand', distance: '1.6 km', time: '10 mins', routes: ['Pink Bus', 'City Ride 1', 'BSRTC 6'] },
  { category: 'bus', name: 'Patliputra Bus Terminal', distance: '9 km', time: '30 mins', routes: ['BSRTC 6', 'Danapur Shuttle'] },
  { category: 'taxi', name: 'Gandhi Maidan Cab Point', distance: '0.4 km', time: '3 mins' },
  { category: 'taxi', name: 'Patna Junction Prepaid Stand', distance: '1.6 km', time: '8 mins' },
  { category: 'taxi', name: 'Boring Road Crossing', distance: '2.8 km', time: '12 mins' },
  { category: 'metro', name: 'Bhootnath', distance: '6.5 km', time: '25 mins by auto' },
  { category: 'metro', name: 'Zero Mile', distance: '8 km', time: '30 mins by auto' },
  { category: 'metro', name: 'Malahi Pakri', distance: '5.5 km', time: '22 mins by auto' },
  { category: 'metro', from: 'Bhootnath', to: 'Patliputra Bus Terminal', time: '10:00 AM' },
  { category: 'metro', from: 'Patliputra Bus Terminal', to: 'Bhootnath', time: '10:15 AM' },
  { category: 'metro', from: 'Malahi Pakri', to: 'Patliputra Bus Terminal', time: '10:30 AM' },
  { category: 'metro', from: 'Patliputra Bus Terminal', to: 'Malahi Pakri', time: '10:05 AM' },
  { category: 'metro', from: 'Bhootnath', to: 'Patliputra Bus Terminal', time: '10:20 AM' },
  { category: 'metro', from: 'Patliputra Bus Terminal', to: 'Bhootnath', time: '10:35 AM' },
  { category: 'train', name: 'Vikramshila Express', platform: '1', time: '10:30 AM' },
  { category: 'train', name: 'Magadh Express', platform: '3', time: '11:00 AM' },
  { category: 'train', name: 'Patna Gaya Passenger', platform: '2', time: '11:30 AM' },
  { category: 'train', name: 'Sampoorna Kranti Express', platform: '1', time: '10:45 AM' },
  { category: 'train', name: 'Shramjeevi Express', platform: '2', time: '11:15 AM' },
  { category: 'train', name: 'Danapur Buxar MEMU', platform: '4', time: '11:45 AM' },
  { category: 'train', name: 'Patna Rajdhani', platform: '1', time: '10:15 AM' },
  { category: 'train', name: 'Bihar Sampark Kranti', platform: '2', time: '10:45 AM' },
  { category: 'train', name: 'Mokama MEMU', platform: '3', time: '11:15 AM' },
  { category: 'train', name: 'Kosi Express', platform: '1', time: '10:00 AM' },
  { category: 'train', name: 'Ganga Damodar Express', platform: '2', time: '10:30 AM' },
  { category: 'train', name: 'Patliputra Passenger', platform: '1', time: '11:00 AM' }
]

export const tinderProfiles = [
  { name: 'Golghar', age: '240', bio: 'Built in 1786 to store grain against famine, and never really used for it. Looking for someone to climb 145 steps with at sunset.', image: '/golghar.jpg', baseStars: 4.6, averageStars: 4.6 },
  { name: 'Mahabodhi Temple', age: '1500+', bio: 'The tree is a descendant of the original. The calm is the original. Looking for anyone who can sit still.', image: '/mahabodhi.jpg', baseStars: 4.9, averageStars: 4.9 },
  { name: 'Nalanda Mahavihara', age: '1600+', bio: 'Had ten thousand students and a nine-storey library before anyone else did. Ruins now, but the red brick still glows at four in the afternoon.', image: '/nalanda.jpg', baseStars: 4.8, averageStars: 4.8 },
  { name: 'Dr. Rajendra Prasad', age: '140+', bio: 'First President of India, from Zeradei in Siwan. Topped every exam he sat — one examiner wrote "examinee is better than examiner".', image: '/buddha-park.jpg', baseStars: 4.7, averageStars: 4.7 },
  { name: 'Takht Sri Patna Sahib', age: '350+', bio: 'Guru Gobind Singh was born here in 1666. The langar has never once turned anyone away.', image: '/patna-sahib.jpg', baseStars: 4.8, averageStars: 4.8 },
  { name: "Sher Shah Suri's Tomb", age: '480', bio: 'Sits in the middle of a lake at Sasaram. Built the Grand Trunk Road and the rupee; still the biggest thing in Rohtas.', image: '/sasaram.jpg', baseStars: 4.6, averageStars: 4.6 }
]
