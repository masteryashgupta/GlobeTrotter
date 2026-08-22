import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface RawCity {
  name: string;
  country: string;
  region: string;
  cost_index: number;
  popularity: number;
  image_url: string;
  activities: Array<{
    name: string;
    category: 'sightseeing' | 'food' | 'adventure' | 'nightlife' | 'culture' | 'shopping' | 'other';
    description: string;
    cost: number;
    duration_minutes: number;
    image_url: string;
  }>;
}

const seedData: RawCity[] = [
  // 1. France
  {
    name: 'Paris', country: 'France', region: 'Europe', cost_index: 5, popularity: 99,
    image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Eiffel Tower Summit Tour', category: 'sightseeing', description: 'Enjoy panoramic views of Paris from the iconic tower summit.', cost: 35.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80' },
      { name: 'Louvre Museum Guided Walk', category: 'culture', description: 'Discover famous masterpieces including Mona Lisa and Venus de Milo.', cost: 65.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80' },
      { name: 'Seine River Evening Cruise', category: 'sightseeing', description: 'Glide along the Seine River with live music and illuminated monuments.', cost: 25.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=800&q=80' },
      { name: 'Montmartre Bakery & Food Tasting', category: 'food', description: 'Sample fresh croissants, macarons, and artisanal cheeses.', cost: 55.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
    ]
  },
  {
    name: 'Nice', country: 'France', region: 'Europe', cost_index: 4, popularity: 85,
    image_url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Promenade des Anglais Stroll', category: 'sightseeing', description: 'Walk along the Mediterranean coastline in Nice.', cost: 0.00, duration_minutes: 60, image_url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80' },
      { name: 'Old Nice Food & Wine Walking Tour', category: 'food', description: 'Taste Socca and Riviera wines with a local guide.', cost: 45.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80' },
      { name: 'Castle Hill Viewpoint Hike', category: 'adventure', description: 'Hike up Castle Hill for sweeping views of the French Riviera.', cost: 0.00, duration_minutes: 75, image_url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80' },
      { name: 'Cours Saleya Flower Market Shopping', category: 'shopping', description: 'Explore colorful market stalls offering local produce and crafts.', cost: 15.00, duration_minutes: 60, image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 2. Japan
  {
    name: 'Tokyo', country: 'Japan', region: 'Asia', cost_index: 4, popularity: 98,
    image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Shibuya Crossing & Harajuku Tour', category: 'sightseeing', description: 'Experience the bustling scramble crossing and pop culture streets.', cost: 20.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80' },
      { name: 'Tsukiji Outer Market Food Tour', category: 'food', description: 'Sample fresh sushi, wagyu skewers, and tamagoyaki.', cost: 50.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80' },
      { name: 'teamLab Planets Digital Art Museum', category: 'culture', description: 'Immerse in breathtaking multi-sensory light art installations.', cost: 28.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=800&q=80' },
      { name: 'Shinjuku Golden Gai Bar Crawl', category: 'nightlife', description: 'Explore tiny atmospheric izakaya bars in historic alleys.', cost: 60.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80' },
    ]
  },
  {
    name: 'Kyoto', country: 'Japan', region: 'Asia', cost_index: 3, popularity: 94,
    image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Fushimi Inari Shrine Hike', category: 'sightseeing', description: 'Walk through thousands of vibrant vermilion torii gates.', cost: 0.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80' },
      { name: 'Arashiyama Bamboo Grove Walk', category: 'sightseeing', description: 'Stroll beneath towering green bamboo stalks in western Kyoto.', cost: 0.00, duration_minutes: 60, image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80' },
      { name: 'Traditional Tea Ceremony Experience', category: 'culture', description: 'Learn the art of preparing matcha from a tea master in Gion.', cost: 40.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80' },
      { name: 'Nishiki Market Street Food Tasting', category: 'food', description: 'Discover local Kyoto delicacies along a 5-block shopping street.', cost: 30.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 3. Italy
  {
    name: 'Rome', country: 'Italy', region: 'Europe', cost_index: 4, popularity: 97,
    image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Colosseum & Roman Forum Guided Access', category: 'culture', description: 'Step back in time to ancient gladiatorial arenas and temples.', cost: 48.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80' },
      { name: 'Vatican Museums & Sistine Chapel Tour', category: 'culture', description: 'Admire Michelangelo frescoes and Renaissance masterpieces.', cost: 55.00, duration_minutes: 210, image_url: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=800&q=80' },
      { name: 'Trastevere Pasta & Gelato Masterclass', category: 'food', description: 'Make fresh carbonara and authentic Italian gelato from scratch.', cost: 75.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80' },
      { name: 'Trevi Fountain & Spanish Steps Night Walk', category: 'sightseeing', description: 'Stroll romantic lit piazzas and throw a coin in Trevi Fountain.', cost: 0.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=800&q=80' },
    ]
  },
  {
    name: 'Florence', country: 'Italy', region: 'Europe', cost_index: 3, popularity: 91,
    image_url: 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Uffizi Gallery Renaissance Art Tour', category: 'culture', description: 'See Botticelli Birth of Venus and Da Vinci paintings.', cost: 38.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=800&q=80' },
      { name: 'Florence Duomo Dome Climb', category: 'adventure', description: 'Ascend 463 steps to the top of Brunelleschis dome.', cost: 30.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80' },
      { name: 'Chianti Wine & Vineyard Tasting Trip', category: 'food', description: 'Tour Tuscan countryside wineries with cheese and olive oil pairing.', cost: 85.00, duration_minutes: 300, image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80' },
      { name: 'San Lorenzo Leather Market Shopping', category: 'shopping', description: 'Browse handcrafted Tuscan leather jackets and bags.', cost: 0.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 4. USA
  {
    name: 'New York City', country: 'USA', region: 'North America', cost_index: 5, popularity: 99,
    image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Statue of Liberty & Ellis Island Ferry', category: 'sightseeing', description: 'Take the ferry to Liberty Island and explore American immigration history.', cost: 25.00, duration_minutes: 240, image_url: 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?auto=format&fit=crop&w=800&q=80' },
      { name: 'Broadway Musical Show Ticket', category: 'culture', description: 'Experience world-class musical theater in the heart of Times Square.', cost: 120.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80' },
      { name: 'Central Park Bike & Walking Tour', category: 'adventure', description: 'Cycle through Bethesdas Terrace, Strawberry Fields, and Bow Bridge.', cost: 35.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80' },
      { name: 'Greenwich Village Pizza & Speakeasy Tour', category: 'food', description: 'Sample famous NY slice joints and hidden speakeasy bars.', cost: 65.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80' },
    ]
  },
  {
    name: 'San Francisco', country: 'USA', region: 'North America', cost_index: 5, popularity: 90,
    image_url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Golden Gate Bridge Cable Car Ride', category: 'sightseeing', description: 'Ride historic cable cars and cross the world-famous suspension bridge.', cost: 15.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80' },
      { name: 'Alcatraz Island Penitentiary Tour', category: 'culture', description: 'Ferry to the maximum-security island prison with cellhouse audio tour.', cost: 45.00, duration_minutes: 210, image_url: 'https://images.unsplash.com/photo-1541464522888-898162c7754a?auto=format&fit=crop&w=800&q=80' },
      { name: 'Mission District Food & Mural Walk', category: 'food', description: 'Eat famous Mission burritos while viewing street art murals.', cost: 40.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80' },
      { name: 'Muir Woods Redwood Forest Hiking', category: 'adventure', description: 'Hike among coastal redwood trees over 1,000 years old.', cost: 30.00, duration_minutes: 240, image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 5. UK
  {
    name: 'London', country: 'UK', region: 'Europe', cost_index: 5, popularity: 97,
    image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Tower of London & Crown Jewels', category: 'culture', description: 'Explore 900 years of royal history and inspect sparkling crowns.', cost: 34.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80' },
      { name: 'Westminster Abbey & Big Ben Walk', category: 'sightseeing', description: 'Visit royal coronation site and iconic clock tower.', cost: 27.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=800&q=80' },
      { name: 'Borough Market Street Food Tour', category: 'food', description: 'Sample British pies, artisan cheeses, and international street treats.', cost: 40.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80' },
      { name: 'Soho Pub Crawl & Live Music', category: 'nightlife', description: 'Visit historic West End pubs frequented by famous musicians.', cost: 30.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80' },
    ]
  },
  {
    name: 'Edinburgh', country: 'UK', region: 'Europe', cost_index: 3, popularity: 88,
    image_url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Edinburgh Castle Tour', category: 'culture', description: 'Explore Scotland fortress atop an extinct volcanic crag.', cost: 22.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80' },
      { name: 'Royal Mile Historic Stroll', category: 'sightseeing', description: 'Walk from castle to Holyrood Palace past cobblestone closes.', cost: 0.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80' },
      { name: 'Scotch Whisky Experience Tasting', category: 'food', description: 'Ride a whisky barrel and taste single malts from 4 regions.', cost: 25.00, duration_minutes: 105, image_url: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=800&q=80' },
      { name: 'Arthurs Seat Summit Hike', category: 'adventure', description: 'Hike to the highest peak in Holyrood Park for panoramic views.', cost: 0.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 6. Thailand
  {
    name: 'Bangkok', country: 'Thailand', region: 'Asia', cost_index: 1, popularity: 96,
    image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Grand Palace & Wat Phra Kaew', category: 'culture', description: 'Marvel at golden spires and the Emerald Buddha temple.', cost: 15.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80' },
      { name: 'Chinatown Yaowarat Midnight Food Tour', category: 'food', description: 'Taste Michelin-lauded Pad Thai, pork belly skewers, and mango sticky rice.', cost: 25.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
      { name: 'Chao Phraya Express Longtail Boat', category: 'sightseeing', description: 'Navigate Bangkoks historic canals and river networks.', cost: 5.00, duration_minutes: 60, image_url: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80' },
      { name: 'Chatuchak Weekend Market Shopping', category: 'shopping', description: 'Explore over 15,000 market stalls selling clothes, antiques, and spices.', cost: 10.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80' },
    ]
  },
  {
    name: 'Chiang Mai', country: 'Thailand', region: 'Asia', cost_index: 1, popularity: 87,
    image_url: 'https://images.unsplash.com/photo-1512553353614-82a7370096dc?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Wat Phra That Doi Suthep Temple Tour', category: 'culture', description: 'Climb 306 dragon steps to a mountain temple with city views.', cost: 8.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1512553353614-82a7370096dc?auto=format&fit=crop&w=800&q=80' },
      { name: 'Ethical Elephant Nature Park Sanctuary Visit', category: 'adventure', description: 'Feed, bathe, and observe rescued elephants in natural habitat.', cost: 80.00, duration_minutes: 360, image_url: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=800&q=80' },
      { name: 'Northern Thai Cooking Class', category: 'food', description: 'Pick ingredients at local market and prepare Khao Soi curry.', cost: 30.00, duration_minutes: 240, image_url: 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?auto=format&fit=crop&w=800&q=80' },
      { name: 'Chiang Mai Night Bazaar Shopping', category: 'shopping', description: 'Shop handmade silver jewelry, woodcarvings, and handicrafts.', cost: 15.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 7. Spain
  {
    name: 'Barcelona', country: 'Spain', region: 'Europe', cost_index: 3, popularity: 96,
    image_url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Sagrada Familia Fast-Track Guided Tour', category: 'culture', description: 'Marvel at Gaudi crowning architectural masterpiece.', cost: 32.00, duration_minutes: 105, image_url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80' },
      { name: 'Park Guell Mosaic Gardens Stroll', category: 'sightseeing', description: 'Explore colorful mosaic benches and dragon statues overlooking Barcelona.', cost: 14.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?auto=format&fit=crop&w=800&q=80' },
      { name: 'Gothic Quarter Tapas & Sangria Crawl', category: 'food', description: 'Sample Jamon Iberico, patatas bravas, and Spanish wines.', cost: 45.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&w=800&q=80' },
      { name: 'Barceloneta Beach Sunset Paddleboarding', category: 'adventure', description: 'Paddle along Barcelonas sandy coast during golden hour.', cost: 25.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
    ]
  },
  {
    name: 'Madrid', country: 'Spain', region: 'Europe', cost_index: 3, popularity: 92,
    image_url: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Prado Museum Masterpieces Tour', category: 'culture', description: 'See iconic works by Goya, Velazquez, and El Greco.', cost: 25.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=800&q=80' },
      { name: 'Royal Palace of Madrid Tour', category: 'culture', description: 'Walk through official royal reception rooms and armory.', cost: 18.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=800&q=80' },
      { name: 'El Rastro Flea Market Shopping', category: 'shopping', description: 'Browse vintage clothing, antiques, and books in La Latina.', cost: 0.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80' },
      { name: 'Authentic Flamenco Show with Wine', category: 'nightlife', description: 'Watch passionate dancing and live guitar at a tablao.', cost: 35.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 8. Australia
  {
    name: 'Sydney', country: 'Australia', region: 'Oceania', cost_index: 4, popularity: 95,
    image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Sydney Opera House Architectural Tour', category: 'culture', description: 'Step inside the world-famous UNESCO sails and theaters.', cost: 30.00, duration_minutes: 60, image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80' },
      { name: 'Bondi to Coogee Coastal Walk', category: 'adventure', description: 'Scenic 6km cliffside walk passing ocean pools and beaches.', cost: 0.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
      { name: 'Sydney Harbour Sunset Kayak', category: 'adventure', description: 'Paddle under the Harbour Bridge as city lights turn on.', cost: 65.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80' },
      { name: 'Paddy Market Seafood & Craft Shopping', category: 'shopping', description: 'Shop fresh oysters, souvenirs, and local artisan goods.', cost: 20.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80' },
    ]
  },
  {
    name: 'Melbourne', country: 'Australia', region: 'Oceania', cost_index: 4, popularity: 91,
    image_url: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Melbourne Laneway Coffee & Street Art Tour', category: 'food', description: 'Discover hidden espresso bars and world-renowned graffiti lanes.', cost: 35.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?auto=format&fit=crop&w=800&q=80' },
      { name: 'Great Ocean Road & 12 Apostles Day Trip', category: 'adventure', description: 'Drive along dramatic coastal cliffs and limestone stacks.', cost: 95.00, duration_minutes: 600, image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
      { name: 'Queen Victoria Market Food Tasting', category: 'food', description: 'Sample Aussie bratwurst, cheeses, and artisanal pastries.', cost: 40.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80' },
      { name: 'Yarra River Evening Rooftop Bar Hop', category: 'nightlife', description: 'Visit trendy skyline rooftop bars along Southbank.', cost: 50.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 9. Brazil
  {
    name: 'Rio de Janeiro', country: 'Brazil', region: 'South America', cost_index: 2, popularity: 93,
    image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Christ the Redeemer & Corcovado Train', category: 'sightseeing', description: 'Ride cog train up to one of the New 7 Wonders of the World.', cost: 30.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80' },
      { name: 'Sugarloaf Mountain Cable Car', category: 'sightseeing', description: 'Glide above Guanabara Bay for panoramic Rio views.', cost: 32.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80' },
      { name: 'Copacabana Caipirinha & Beach Volleyball', category: 'adventure', description: 'Sip fresh caipirinhas and play beach sports with locals.', cost: 15.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
      { name: 'Lapa Samba Night Club Experience', category: 'nightlife', description: 'Dance to live traditional Brazilian samba and choro bands.', cost: 25.00, duration_minutes: 240, image_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80' },
    ]
  },
  {
    name: 'Sao Paulo', country: 'Brazil', region: 'South America', cost_index: 2, popularity: 84,
    image_url: 'https://images.unsplash.com/photo-1543059509-6d53dabe2993?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Paulista Avenue Culture & Museum Walk', category: 'culture', description: 'Explore MASP museum floating glass structure.', cost: 15.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1543059509-6d53dabe2993?auto=format&fit=crop&w=800&q=80' },
      { name: 'Mercadao Gourmet Sandwich Tasting', category: 'food', description: 'Try the famous codfish cake and stacked mortadella sandwich.', cost: 20.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
      { name: 'Beco do Batman Street Art Graffiti Tour', category: 'sightseeing', description: 'Walk through open-air urban art gallery alleys.', cost: 0.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?auto=format&fit=crop&w=800&q=80' },
      { name: 'Vila Madalena Craft Beer Bar Hop', category: 'nightlife', description: 'Sample Brazilian craft IPAs and boteco snacks.', cost: 35.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 10. Egypt
  {
    name: 'Cairo', country: 'Egypt', region: 'Africa', cost_index: 1, popularity: 94,
    image_url: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Giza Pyramids & Sphinx Guided Tour', category: 'culture', description: 'Stand before the Great Pyramid of Khufu and ancient Sphinx.', cost: 25.00, duration_minutes: 240, image_url: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80' },
      { name: 'Egyptian Museum King Tut Treasures', category: 'culture', description: 'View golden death masks and mummies of ancient pharaohs.', cost: 18.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80' },
      { name: 'Khan el-Khalili Bazaar Shopping', category: 'shopping', description: 'Bargain for brass lanterns, perfumes, and papyrus scrolls.', cost: 10.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80' },
      { name: 'Nile Felucca Sunset Sailing', category: 'adventure', description: 'Sail traditional wooden sailboat along the river Nile.', cost: 20.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80' },
    ]
  },
  {
    name: 'Luxor', country: 'Egypt', region: 'Africa', cost_index: 1, popularity: 89,
    image_url: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Valley of the Kings Tombs Tour', category: 'culture', description: 'Descend into colorful pharaonic underground tombs.', cost: 30.00, duration_minutes: 210, image_url: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80' },
      { name: 'Karnak Temple Complex Walk', category: 'culture', description: 'Walk through massive hypostyle hall of 134 giant stone pillars.', cost: 15.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80' },
      { name: 'Sunrise Hot Air Balloon Over Luxor', category: 'adventure', description: 'Float over West Bank temples and sugarcane fields at dawn.', cost: 85.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=800&q=80' },
      { name: 'Nile River Dinner Cruise & Tanoura Dance', category: 'nightlife', description: 'Enjoy Egyptian buffet with whirling dervish performance.', cost: 35.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 11. South Africa
  {
    name: 'Cape Town', country: 'South Africa', region: 'Africa', cost_index: 2, popularity: 94,
    image_url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Table Mountain Cableway Hike', category: 'adventure', description: 'Take cable car or summit Platteklip Gorge trail.', cost: 22.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80' },
      { name: 'Boulders Beach Penguin Colony Visit', category: 'sightseeing', description: 'Walk boardwalks alongside wild African penguins.', cost: 12.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
      { name: 'Cape Point & Good Hope Scenic Drive', category: 'adventure', description: 'Drive along Chapman Peak to dramatic southwestern tip of Africa.', cost: 35.00, duration_minutes: 360, image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
      { name: 'V&A Waterfront Seafood & Craft Market', category: 'food', description: 'Dine on fresh oysters and crayfish overlooking harbour.', cost: 40.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 12. UAE
  {
    name: 'Dubai', country: 'UAE', region: 'Middle East', cost_index: 5, popularity: 97,
    image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Burj Khalifa At the Top Observation Deck', category: 'sightseeing', description: 'Ascend to 124th floor of worlds tallest skyscraper.', cost: 45.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80' },
      { name: 'Desert Safari Dune Bashing & BBQ', category: 'adventure', description: '4x4 dune bashing, camel riding, and Bedouin camp dinner.', cost: 65.00, duration_minutes: 360, image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80' },
      { name: 'Dubai Mall & Fountain Show Walk', category: 'shopping', description: 'Watch choreography of light and water near luxury boutiques.', cost: 0.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80' },
      { name: 'Old Dubai Gold & Spice Souk Boat Ride', category: 'culture', description: 'Cross Dubai Creek on Abra boat and browse traditional souks.', cost: 5.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 13. India
  {
    name: 'New Delhi', country: 'India', region: 'Asia', cost_index: 1, popularity: 91,
    image_url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Old Delhi Rickshaw & Street Food Tour', category: 'food', description: 'Ride through Chandni Chowk sampling jalebis and parathas.', cost: 20.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
      { name: 'Qutub Minar & Humayun Tomb Architecture', category: 'culture', description: 'Tour UNESCO red sandstone monuments and Mughal gardens.', cost: 12.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80' },
      { name: 'Lotus Temple & India Gate Walk', category: 'sightseeing', description: 'Visit Bahai Lotus Temple and ceremonial Boulevard.', cost: 0.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80' },
      { name: 'Dilli Haat Handicraft & Regional Food Fair', category: 'shopping', description: 'Shop traditional textiles and state regional delicacies.', cost: 5.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80' },
    ]
  },
  {
    name: 'Mumbai', country: 'India', region: 'Asia', cost_index: 2, popularity: 90,
    image_url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Gateway of India & Colaba Stroll', category: 'sightseeing', description: 'View iconic waterfront arch and Victorian architecture.', cost: 0.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80' },
      { name: 'Marine Drive Queens Necklace Sunset', category: 'sightseeing', description: 'Walk along Arabian Sea promenade at twilight.', cost: 0.00, duration_minutes: 60, image_url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80' },
      { name: 'Elephanta Caves Island Boat Trip', category: 'culture', description: 'Ferry to island cave temples dedicated to Lord Shiva.', cost: 15.00, duration_minutes: 240, image_url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80' },
      { name: 'Chowpatty Beach Pav Bhaji & Chaat', category: 'food', description: 'Taste Mumbai famous spicy Pav Bhaji and Bhel Puri.', cost: 8.00, duration_minutes: 60, image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
    ]
  },
  {
    name: 'Jaipur', country: 'India', region: 'Asia', cost_index: 1, popularity: 92,
    image_url: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Amber Fort Elephant Rampart Tour', category: 'culture', description: 'Explore hill fortress with courtyards and Sheesh Mahal mirror palace.', cost: 15.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80' },
      { name: 'Hawa Mahal Palace of Winds Viewing', category: 'sightseeing', description: 'Photograph 953 honeycomb windows designed for royal ladies.', cost: 5.00, duration_minutes: 60, image_url: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80' },
      { name: 'Johari Bazaar Block Print Textile Shopping', category: 'shopping', description: 'Shop handmade silver jewelry, pottery, and block print quilts.', cost: 20.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80' },
      { name: 'Rajasthani Thali Cultural Dinner', category: 'food', description: 'Feast on Dal Baati Churma with live folk dance.', cost: 18.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 14. Mexico
  {
    name: 'Mexico City', country: 'Mexico', region: 'North America', cost_index: 2, popularity: 92,
    image_url: 'https://images.unsplash.com/photo-1518659267384-78f59ee96259?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Frida Kahlo Museum Casa Azul Visit', category: 'culture', description: 'Explore artist birthplace and vivid blue house in Coyoacan.', cost: 18.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1518659267384-78f59ee96259?auto=format&fit=crop&w=800&q=80' },
      { name: 'Teotihuacan Pyramids Day Trip', category: 'culture', description: 'Climb Pyramids of the Sun and Moon near ancient city.', cost: 40.00, duration_minutes: 300, image_url: 'https://images.unsplash.com/photo-1518659267384-78f59ee96259?auto=format&fit=crop&w=800&q=80' },
      { name: 'Roma & Condesa Taco Crawl', category: 'food', description: 'Eat al pastor tacos, churros, and artisanal mezcal.', cost: 35.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80' },
      { name: 'Xochimilco Trajinera Boat Fiesta', category: 'adventure', description: 'Cruise ancient Aztec canals in colorful wooden boats with mariachi.', cost: 25.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 15. Canada
  {
    name: 'Vancouver', country: 'Canada', region: 'North America', cost_index: 4, popularity: 90,
    image_url: 'https://images.unsplash.com/photo-1559511260-66a654ae982a?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Stanley Park Seawall Cycling', category: 'adventure', description: 'Bike 9km coastal path around urban rainforest.', cost: 20.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1559511260-66a654ae982a?auto=format&fit=crop&w=800&q=80' },
      { name: 'Capilano Suspension Bridge Walk', category: 'adventure', description: 'Cross 137m suspension bridge over rainforest canyon.', cost: 50.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80' },
      { name: 'Granville Island Public Market Food Tour', category: 'food', description: 'Sample wild smoked salmon, clam chowder, and donuts.', cost: 45.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80' },
      { name: 'Gastown Steam Clock & Historic Walk', category: 'sightseeing', description: 'See iconic whistle clock and brick cobblestone streets.', cost: 0.00, duration_minutes: 60, image_url: 'https://images.unsplash.com/photo-1559511260-66a654ae982a?auto=format&fit=crop&w=800&q=80' },
    ]
  },
  {
    name: 'Toronto', country: 'Canada', region: 'North America', cost_index: 4, popularity: 89,
    image_url: 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'CN Tower EdgeWalk & Observation Deck', category: 'adventure', description: 'Walk hands-free 116 storeys above downtown ground.', cost: 45.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?auto=format&fit=crop&w=800&q=80' },
      { name: 'Kensington Market Bohemian Food Stroll', category: 'food', description: 'Taste Jamaican patties, empanadas, and craft brews.', cost: 35.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
      { name: 'Toronto Islands Ferry & Sunset View', category: 'sightseeing', description: 'Ferry across Lake Ontario for iconic city skyline views.', cost: 10.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
      { name: 'Distillery Historic District Shopping', category: 'shopping', description: 'Browse Victorian industrial brick buildings with galleries.', cost: 0.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 16. Germany
  {
    name: 'Berlin', country: 'Germany', region: 'Europe', cost_index: 3, popularity: 93,
    image_url: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Brandenburg Gate & Reichstag Dome', category: 'sightseeing', description: 'Visit historic reunification gate and glass dome parliament.', cost: 0.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=800&q=80' },
      { name: 'East Side Gallery Wall Murals Walk', category: 'culture', description: 'Walk longest remaining section of Berlin Wall art.', cost: 0.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=800&q=80' },
      { name: 'Currywurst & Craft Beer Tasting', category: 'food', description: 'Sample iconic sausage dish with spicy tomato curry sauce.', cost: 15.00, duration_minutes: 60, image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
      { name: 'Kreuzberg Techno & Underground Nightlife', category: 'nightlife', description: 'Experience famous electronic dance music club culture.', cost: 25.00, duration_minutes: 240, image_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80' },
    ]
  },
  {
    name: 'Munich', country: 'Germany', region: 'Europe', cost_index: 4, popularity: 90,
    image_url: 'https://images.unsplash.com/photo-1595867818082-083862f3d630?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Marienplatz & Glockenspiel Chime Show', category: 'sightseeing', description: 'Watch motorized figurines dance in town hall tower.', cost: 0.00, duration_minutes: 60, image_url: 'https://images.unsplash.com/photo-1595867818082-083862f3d630?auto=format&fit=crop&w=800&q=80' },
      { name: 'Hofbrauhaus Bavarian Beer Hall Dinner', category: 'food', description: 'Sip one-liter beer steins with pretzels and pork knuckle.', cost: 35.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80' },
      { name: 'Neuschwanstein Castle Day Excursion', category: 'culture', description: 'Tour fairy-tale castle nestled in Bavarian Alps.', cost: 65.00, duration_minutes: 480, image_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80' },
      { name: 'English Garden River Surfing Watching', category: 'adventure', description: 'Watch surfers ride Eisbach standing wave in public park.', cost: 0.00, duration_minutes: 60, image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 17. Indonesia
  {
    name: 'Bali', country: 'Indonesia', region: 'Asia', cost_index: 1, popularity: 98,
    image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Tegallalang Rice Terrace & Jungle Swing', category: 'adventure', description: 'Swing high over lush green terraced valley in Ubud.', cost: 15.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80' },
      { name: 'Uluwatu Sunset Temple & Kecak Fire Dance', category: 'culture', description: 'Watch traditional chanting performance on cliff edge.', cost: 12.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80' },
      { name: 'Mount Batur Sunrise Volcano Trek', category: 'adventure', description: 'Hike active volcano at dawn for breakfast above clouds.', cost: 45.00, duration_minutes: 360, image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
      { name: 'Canggu Beachfront Sunset Cocktail', category: 'nightlife', description: 'Relax at beach club with tropical cocktails and beats.', cost: 20.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 18. Netherlands
  {
    name: 'Amsterdam', country: 'Netherlands', region: 'Europe', cost_index: 4, popularity: 95,
    image_url: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Rijksmuseum Golden Age Art Tour', category: 'culture', description: 'See Rembrandts Night Watch and Vermeers Milkmaid.', cost: 25.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80' },
      { name: 'Historic Canal Belt Open Boat Cruise', category: 'sightseeing', description: 'Cruise UNESCO canals with cheese and Dutch stroopwafels.', cost: 22.00, duration_minutes: 75, image_url: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80' },
      { name: 'Van Gogh Museum Life & Art Tour', category: 'culture', description: 'Explore largest collection of Van Gogh paintings and letters.', cost: 24.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80' },
      { name: 'Jordaan District Boutique Shopping', category: 'shopping', description: 'Browse narrow streets filled with vintage shops and cafes.', cost: 0.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 19. Singapore
  {
    name: 'Singapore', country: 'Singapore', region: 'Asia', cost_index: 5, popularity: 95,
    image_url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Gardens by the Bay Supertree Grove', category: 'sightseeing', description: 'Walk OCBC Skyway among giant futuristic solar supertrees.', cost: 14.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80' },
      { name: 'Marina Bay Sands Skypark Deck', category: 'sightseeing', description: 'View Singapore skyline 57 storeys up above Marina Bay.', cost: 26.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80' },
      { name: 'Lau Pa Sat Hawker Center Dinner', category: 'food', description: 'Taste Hainanese chicken rice, satay, and laksa noodle soup.', cost: 15.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
      { name: 'Chinatown & Little India Heritage Walk', category: 'culture', description: 'Explore colorful temples, spice shops, and heritage shophouses.', cost: 0.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 20. Turkey
  {
    name: 'Istanbul', country: 'Turkey', region: 'Europe', cost_index: 2, popularity: 95,
    image_url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Hagia Sophia & Blue Mosque Guided Tour', category: 'culture', description: 'Marvel at Byzantine domes and intricate Ottoman tilework.', cost: 25.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80' },
      { name: 'Grand Bazaar & Spice Market Shopping', category: 'shopping', description: 'Navigate over 4,000 shops selling rugs, teas, and ceramics.', cost: 10.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80' },
      { name: 'Bosphorus Strait Cruise Between Continents', category: 'sightseeing', description: 'Sail between Europe and Asia past palaces and fortresses.', cost: 15.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80' },
      { name: 'Karakoy Baklava & Turkish Coffee Tasting', category: 'food', description: 'Taste layered pistachio baklava paired with charcoal-brewed coffee.', cost: 12.00, duration_minutes: 60, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
    ]
  },
  {
    name: 'Cappadocia', country: 'Turkey', region: 'Asia', cost_index: 2, popularity: 92,
    image_url: 'https://images.unsplash.com/photo-1609825488888-3a766db05542?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Sunrise Hot Air Balloon Flight', category: 'adventure', description: 'Float over fairy chimneys and carved rock valleys at sunrise.', cost: 180.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=800&q=80' },
      { name: 'Goreme Open Air Museum Rock Churches', category: 'culture', description: 'Explore UNESCO cave churches painted with ancient frescoes.', cost: 15.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1609825488888-3a766db05542?auto=format&fit=crop&w=800&q=80' },
      { name: 'Derinkuyu Underground City Hike', category: 'adventure', description: 'Descend 8 levels into ancient multi-story underground city.', cost: 12.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1609825488888-3a766db05542?auto=format&fit=crop&w=800&q=80' },
      { name: 'Traditional Anatolian Pottery Workshop', category: 'other', description: 'Try throwing clay on kick-wheel with Avanos pottery masters.', cost: 20.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 21. South Korea
  {
    name: 'Seoul', country: 'South Korea', region: 'Asia', cost_index: 3, popularity: 95,
    image_url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Gyeongbokgung Palace Hanbok Tour', category: 'culture', description: 'Wear traditional Hanbok dress to tour royal palace grounds.', cost: 15.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80' },
      { name: 'Myeongdong K-Beauty & Street Food Stroll', category: 'shopping', description: 'Shop skincare products and eat Korean fried chicken & tteokbokki.', cost: 30.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
      { name: 'N Seoul Tower Cable Car View', category: 'sightseeing', description: 'Ascend Namsan mountain for panoramic Seoul city views.', cost: 12.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80' },
      { name: 'Hongdae Indie Music & Nightlife Crawl', category: 'nightlife', description: 'Experience student street busking and youth club culture.', cost: 25.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 22. Argentina
  {
    name: 'Buenos Aires', country: 'Argentina', region: 'South America', cost_index: 2, popularity: 89,
    image_url: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'La Boca Caminito Colorful Walk', category: 'sightseeing', description: 'Photograph street performers and painted wooden houses.', cost: 0.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=800&q=80' },
      { name: 'Palermo Asado Steak & Malbec Wine Dinner', category: 'food', description: 'Savor traditional Argentine grilled beef and red wine.', cost: 40.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
      { name: 'Tango Show & Dance Workshop in San Telmo', category: 'culture', description: 'Watch world-class dancers and take beginner tango steps.', cost: 45.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80' },
      { name: 'Recoleto Cemetery Historic Architecture', category: 'culture', description: 'Visit mausoleums of historical figures including Evita Peron.', cost: 8.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 23. Greece
  {
    name: 'Athens', country: 'Greece', region: 'Europe', cost_index: 3, popularity: 93,
    image_url: 'https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Acropolis & Parthenon Ancient Ruins Tour', category: 'culture', description: 'Walk around 5th-century BC temples atop rocky citadel.', cost: 20.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=800&q=80' },
      { name: 'Plaka District Souvlaki & Wine Walk', category: 'food', description: 'Eat gyro skewers and tzatziki under lit ruins.', cost: 25.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
      { name: 'Acropolis Museum Glass Floor Walk', category: 'culture', description: 'View ancient artifacts excavated directly beneath museum site.', cost: 15.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=800&q=80' },
      { name: 'Monastiraki Flea Market Antique Shopping', category: 'shopping', description: 'Shop Greek leather sandals, icons, and copperware.', cost: 10.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80' },
    ]
  },
  {
    name: 'Santorini', country: 'Greece', region: 'Europe', cost_index: 5, popularity: 97,
    image_url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Oia Sunset Blue Dome Viewpoint Walk', category: 'sightseeing', description: 'Photograph iconic white whitewashed houses and blue domes.', cost: 0.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80' },
      { name: 'Santorini Caldera Catamaran Cruise', category: 'adventure', description: 'Sail volcanic caldera with snorkeling at Red Beach and BBQ.', cost: 110.00, duration_minutes: 300, image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80' },
      { name: 'Volcanic Assyrtiko Wine Tasting', category: 'food', description: 'Sample crisp white wines grown in basket-trained vines.', cost: 45.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80' },
      { name: 'Fira to Oia Cliffside Hike', category: 'adventure', description: 'Hike 10km trail along volcanic crater edge.', cost: 0.00, duration_minutes: 210, image_url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 24. Vietnam
  {
    name: 'Hanoi', country: 'Vietnam', region: 'Asia', cost_index: 1, popularity: 91,
    image_url: 'https://images.unsplash.com/photo-1509030450996-93f2e3d8ed05?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Old Quarter Egg Coffee & Pho Tour', category: 'food', description: 'Sip rich creamy egg coffee and authentic beef Pho.', cost: 15.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
      { name: 'Ha Long Bay Overnight Cruise Excursion', category: 'adventure', description: 'Kayak through limestone karsts and emerald waters.', cost: 120.00, duration_minutes: 1440, image_url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80' },
      { name: 'Hoan Kiem Lake & Ngoc Son Temple', category: 'sightseeing', description: 'Stroll around peaceful lake in historic city center.', cost: 2.00, duration_minutes: 60, image_url: 'https://images.unsplash.com/photo-1509030450996-93f2e3d8ed05?auto=format&fit=crop&w=800&q=80' },
      { name: 'Thang Long Water Puppet Show', category: 'culture', description: 'Watch traditional Vietnamese folk tales performed on water stage.', cost: 8.00, duration_minutes: 60, image_url: 'https://images.unsplash.com/photo-1509030450996-93f2e3d8ed05?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 25. Peru
  {
    name: 'Cusco', country: 'Peru', region: 'South America', cost_index: 2, popularity: 94,
    image_url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Machu Picchu Citadel Guided Tour', category: 'culture', description: 'Explore iconic 15th-century Inca sanctuary in cloud forest.', cost: 90.00, duration_minutes: 360, image_url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80' },
      { name: 'Sacred Valley Pisac Market & Fortress', category: 'adventure', description: 'Visit Andean terraced ruins and artisan craft market.', cost: 35.00, duration_minutes: 300, image_url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80' },
      { name: 'Rainbow Mountain Vinicunca Trek', category: 'adventure', description: 'Challenge high altitude hike to 5,200m striped mineral mountain.', cost: 45.00, duration_minutes: 600, image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
      { name: 'San Pedro Market Ceviche & Cocoa Tasting', category: 'food', description: 'Sample fresh trout ceviche and coca leaf tea.', cost: 10.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 26. Morocco
  {
    name: 'Marrakech', country: 'Morocco', region: 'Africa', cost_index: 2, popularity: 93,
    image_url: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Jemaa el-Fnaa Night Market & Storytellers', category: 'sightseeing', description: 'Experience vibrant square with snake charmers and food stalls.', cost: 0.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=800&q=80' },
      { name: 'Medina Souks Leather & Spice Shopping', category: 'shopping', description: 'Bargain for Moroccan lamps, babouche slippers, and argan oil.', cost: 15.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80' },
      { name: 'Jardin Majorelle & Yves Saint Laurent Museum', category: 'culture', description: 'Stroll electric blue botanical gardens designed by Jacques Majorelle.', cost: 16.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=800&q=80' },
      { name: 'Traditional Hammam Spa & Massage', category: 'other', description: 'Relax in steam bath with black soap scrub and argan massage.', cost: 35.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 27. Portugal
  {
    name: 'Lisbon', country: 'Portugal', region: 'Europe', cost_index: 3, popularity: 94,
    image_url: 'https://images.unsplash.com/photo-1509839862600-e09c574472f7?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Tram 28 Historic Neighborhood Ride', category: 'sightseeing', description: 'Ride yellow vintage tram through Alfama and Graca hills.', cost: 3.00, duration_minutes: 60, image_url: 'https://images.unsplash.com/photo-1509839862600-e09c574472f7?auto=format&fit=crop&w=800&q=80' },
      { name: 'Belem Tower & Pastel de Nata Tasting', category: 'food', description: 'Eat warm custard tarts at Pasteis de Belem after tower visit.', cost: 12.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
      { name: 'Sintra Peña Palace Day Trip', category: 'culture', description: 'Explore romantic fairy-tale yellow and red palace in Sintra hills.', cost: 40.00, duration_minutes: 360, image_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80' },
      { name: 'Bairro Alto Fado Evening Dinner', category: 'nightlife', description: 'Listen to melancholic guitar fado music while enjoying codfish.', cost: 35.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 28. Czech Republic
  {
    name: 'Prague', country: 'Czech Republic', region: 'Europe', cost_index: 2, popularity: 93,
    image_url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Charles Bridge & Old Town Astronomical Clock', category: 'sightseeing', description: 'Walk iconic statue-lined bridge and see hourly mechanical show.', cost: 0.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80' },
      { name: 'Prague Castle & St. Vitus Cathedral Tour', category: 'culture', description: 'Explore vast 9th-century castle complex and gothic cathedral.', cost: 16.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80' },
      { name: 'Pilsner Czech Beer Tasting & Cellar Walk', category: 'food', description: 'Sample unpasteurized Czech lagers in underground cellars.', cost: 20.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80' },
      { name: 'Vltava River Sunset Pedal Boat Rental', category: 'adventure', description: 'Rent swan pedal boat for views of Prague castle skyline.', cost: 15.00, duration_minutes: 60, image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 29. Austria
  {
    name: 'Vienna', country: 'Austria', region: 'Europe', cost_index: 4, popularity: 91,
    image_url: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Schonbrunn Palace & Imperial Gardens', category: 'culture', description: 'Tour summer residence of Habsburg monarchs and maze.', cost: 24.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=800&q=80' },
      { name: 'Viennese Coffeehouse Sacher Torte Tasting', category: 'food', description: 'Sip Melange coffee with original chocolate Sachertorte cake.', cost: 18.00, duration_minutes: 75, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
      { name: 'Belvedere Palace Klimt Kiss Art Tour', category: 'culture', description: 'View Gustav Klimt famous golden painting The Kiss.', cost: 19.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=800&q=80' },
      { name: 'Vienna State Opera House Guided Tour', category: 'culture', description: 'Inspect marble staircases and auditorium of famous opera.', cost: 13.00, duration_minutes: 60, image_url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 30. Switzerland
  {
    name: 'Zurich', country: 'Switzerland', region: 'Europe', cost_index: 5, popularity: 88,
    image_url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Lake Zurich Scenic Boat Cruise', category: 'sightseeing', description: 'Glide past alpine hamlets with views of snowcapped peaks.', cost: 30.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80' },
      { name: 'Lindt Home of Chocolate Interactive Museum', category: 'food', description: 'Marvel at 9m chocolate fountain and sample Swiss pralines.', cost: 17.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
      { name: 'Uetliberg Mountain Viewpoint Train', category: 'adventure', description: 'Take train up Zurich local mountain for panoramic city view.', cost: 20.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
      { name: 'Bahnhofstrasse Luxury Window Shopping', category: 'shopping', description: 'Stroll one of the world most exclusive shopping avenues.', cost: 0.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 31. New Zealand
  {
    name: 'Auckland', country: 'New Zealand', region: 'Oceania', cost_index: 4, popularity: 87,
    image_url: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Auckland Sky Tower Deck & SkyWalk', category: 'adventure', description: 'View 360-degree vistas 220 meters above city level.', cost: 28.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=80' },
      { name: 'Waiheke Island Wine Tasting Ferry', category: 'food', description: 'Ferry to island known for boutique vineyards and olive groves.', cost: 75.00, duration_minutes: 360, image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80' },
      { name: 'Rangitoto Island Volcanic Summit Hike', category: 'adventure', description: 'Hike through lava fields to volcanic cone summit.', cost: 35.00, duration_minutes: 240, image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
      { name: 'Viaduct Harbour Dinner & Cocktails', category: 'nightlife', description: 'Dine at waterfront restaurants overlooking luxury yachts.', cost: 50.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 32. Turkey / Others
  {
    name: 'Antalya', country: 'Turkey', region: 'Europe', cost_index: 2, popularity: 86,
    image_url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Kaleiçi Old Town Historic Walk', category: 'sightseeing', description: 'Stroll Ottoman-era cobblestone streets down to ancient harbor.', cost: 0.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80' },
      { name: 'Duden Waterfalls Boat Tour', category: 'adventure', description: 'Watch freshwater cascades plunge directly into Mediterranean sea.', cost: 20.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
      { name: 'Hadrians Gate Roman Monument', category: 'culture', description: 'Inspect 2nd-century triple-arched marble triumphal arch.', cost: 0.00, duration_minutes: 45, image_url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80' },
      { name: 'Lara Beach Sunset Resort Relaxation', category: 'sightseeing', description: 'Relax on golden sands with beachside drinks.', cost: 10.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 33. Philippines
  {
    name: 'Manila', country: 'Philippines', region: 'Asia', cost_index: 1, popularity: 82,
    image_url: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Intramuros Walled City Kalesa Ride', category: 'culture', description: 'Tour Spanish colonial era fortress in horse-drawn carriage.', cost: 10.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=800&q=80' },
      { name: 'Binondo Oldest Chinatown Food Crawl', category: 'food', description: 'Sample lumpia, pork buns, and halo-halo shaved ice dessert.', cost: 15.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
      { name: 'Manila Bay Sunset Promenade Walk', category: 'sightseeing', description: 'Watch world-famous Manila Bay golden hour sunset.', cost: 0.00, duration_minutes: 60, image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
      { name: 'BGC Bonifacio Global City Nightlife', category: 'nightlife', description: 'Explore modern high-end cocktail lounges and microbreweries.', cost: 30.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 34. Malaysia
  {
    name: 'Kuala Lumpur', country: 'Malaysia', region: 'Asia', cost_index: 1, popularity: 90,
    image_url: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Petronas Twin Towers Skybridge Visit', category: 'sightseeing', description: 'Cross glass bridge 170m above ground between twin towers.', cost: 22.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80' },
      { name: 'Batu Caves Lord Murugan Shrine Climb', category: 'culture', description: 'Climb 272 rainbow steps into massive limestone cave temple.', cost: 0.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80' },
      { name: 'Jalan Alor Night Market Food Feast', category: 'food', description: 'Eat grilled chicken wings, char kway teow, and durian.', cost: 15.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
      { name: 'Central Market Batik & Craft Shopping', category: 'shopping', description: 'Shop handmade Malaysian batik shirts and pewter souvenirs.', cost: 15.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 35. Hungary
  {
    name: 'Budapest', country: 'Hungary', region: 'Europe', cost_index: 2, popularity: 92,
    image_url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Szechenyi Thermal Bath Relaxation', category: 'other', description: 'Soak in medicinal natural hot spring waters in outdoor palace pool.', cost: 28.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80' },
      { name: 'Fishermans Bastion & Buda Castle Walk', category: 'sightseeing', description: 'Take panoramic photos of Parliament across Danube river.', cost: 0.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80' },
      { name: 'Szimpla Kert Ruin Bar Drink', category: 'nightlife', description: 'Drink craft beer inside famous converted abandoned building pub.', cost: 10.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80' },
      { name: 'Danube River Illuminated Night Cruise', category: 'sightseeing', description: 'Sail past lit Hungarian parliament with glass of champagne.', cost: 22.00, duration_minutes: 75, image_url: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 36. Norway
  {
    name: 'Oslo', country: 'Norway', region: 'Europe', cost_index: 5, popularity: 86,
    image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Oslo Opera House Roof Walk', category: 'sightseeing', description: 'Walk directly on marble roof sloping into Oslo fjord.', cost: 0.00, duration_minutes: 60, image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80' },
      { name: 'Munch Museum Scream Artwork Tour', category: 'culture', description: 'View Edvard Munch iconic Expressionist painting The Scream.', cost: 18.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80' },
      { name: 'Vigeland Sculpture Park Stroll', category: 'culture', description: 'Explore over 200 granite and bronze human sculptures.', cost: 0.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80' },
      { name: 'Fjord Electric Boat Tour', category: 'adventure', description: 'Silent zero-emission cruise through Oslofjord islands.', cost: 40.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 37. Ireland
  {
    name: 'Dublin', country: 'Ireland', region: 'Europe', cost_index: 4, popularity: 90,
    image_url: 'https://images.unsplash.com/photo-1549918864-48ac978761a4?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Guinness Storehouse Experience & Gravity Bar', category: 'food', description: 'Learn brewing history and enjoy pint with 360 city view.', cost: 28.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80' },
      { name: 'Trinity College & Book of Kells Exhibition', category: 'culture', description: 'View 9th-century illuminated Gospel manuscript in Long Room.', cost: 19.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1549918864-48ac978761a4?auto=format&fit=crop&w=800&q=80' },
      { name: 'Temple Bar Live Irish Music Crawl', category: 'nightlife', description: 'Listen to fiddle and bodhran players in cobbled pub quarter.', cost: 20.00, duration_minutes: 180, image_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80' },
      { name: 'Cliffs of Moher Day Tour', category: 'adventure', description: 'Excursion to 214m vertical Atlantic sea cliffs.', cost: 75.00, duration_minutes: 600, image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 38. Sweden
  {
    name: 'Stockholm', country: 'Sweden', region: 'Europe', cost_index: 4, popularity: 89,
    image_url: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Vasa Museum 17th Century Warship', category: 'culture', description: 'View remarkably preserved 1628 royal warship salvaged from harbor.', cost: 20.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=800&q=80' },
      { name: 'Gamla Stan Old Town Cobblestone Walk', category: 'sightseeing', description: 'Explore narrow medieval alleys and royal palace guard change.', cost: 0.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=800&q=80' },
      { name: 'Swedish Fika Coffee & Cinnamon Bun Tasting', category: 'food', description: 'Enjoy traditional Fika break with cardamom & cinnamon buns.', cost: 12.00, duration_minutes: 60, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
      { name: 'Stockholm Archipelago Island Hopping', category: 'adventure', description: 'Ferry across 30,000 island archipelago for nature walks.', cost: 35.00, duration_minutes: 300, image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 39. South Korea
  {
    name: 'Busan', country: 'South Korea', region: 'Asia', cost_index: 2, popularity: 88,
    image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'Gamcheon Culture Village Pastel Walk', category: 'sightseeing', description: 'Walk hillside village known as the Santorini of Korea.', cost: 0.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80' },
      { name: 'Haeundae Beach & Blue Line Park Capsule Train', category: 'adventure', description: 'Ride retro coastal train above ocean cliffs.', cost: 16.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
      { name: 'Jagalchi Seafood Market Raw Fish Tasting', category: 'food', description: 'Pick fresh seafood downstairs and eat it prepared upstairs.', cost: 30.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
      { name: 'Haedong Yonggungsa Seaside Temple', category: 'culture', description: 'Visit rare coastal Buddhist temple built on ocean rocks.', cost: 0.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80' },
    ]
  },

  // 40. Argentina / Chile
  {
    name: 'Santiago', country: 'Chile', region: 'South America', cost_index: 3, popularity: 85,
    image_url: 'https://images.unsplash.com/photo-1518659267384-78f59ee96259?auto=format&fit=crop&w=800&q=80',
    activities: [
      { name: 'San Cristobal Hill Funicular & Statue', category: 'sightseeing', description: 'Ride funicular for views of Santiago backed by Andes mountains.', cost: 6.00, duration_minutes: 120, image_url: 'https://images.unsplash.com/photo-1518659267384-78f59ee96259?auto=format&fit=crop&w=800&q=80' },
      { name: 'Maipo Valley Cabernet Sauvignon Winery Tour', category: 'food', description: 'Tour historical vineyards at the foot of the Andes.', cost: 55.00, duration_minutes: 240, image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80' },
      { name: 'Lastarria & Bellavista Neighborhood Walk', category: 'culture', description: 'Explore bohemian street art cafes and Pablo Neruda home.', cost: 12.00, duration_minutes: 150, image_url: 'https://images.unsplash.com/photo-1518659267384-78f59ee96259?auto=format&fit=crop&w=800&q=80' },
      { name: 'Mercado Central Seafood Empanada Lunch', category: 'food', description: 'Try king crab and fried fish empanadas in historic iron market.', cost: 20.00, duration_minutes: 90, image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
    ]
  }
];

export async function runSeed() {
  console.log(`Starting GlobeTrotter Database Seed... Target URL: ${supabaseUrl}`);
  console.log(`Cities to process: ${seedData.length}`);

  let totalActivities = 0;
  for (const c of seedData) {
    totalActivities += c.activities.length;
  }
  console.log(`Activities to process: ${totalActivities}`);

  // Generate SQL file content as backup
  let sqlContent = `-- Idempotent Master Data Seed File for GlobeTrotter
-- Cities and Activities Seed Data

`;

  let insertedCities = 0;
  let insertedActivities = 0;

  for (const item of seedData) {
    // Escape single quotes for SQL generator
    const cityNameEsc = item.name.replace(/'/g, "''");
    const countryEsc = item.country.replace(/'/g, "''");
    const regionEsc = item.region.replace(/'/g, "''");
    const imageEsc = item.image_url.replace(/'/g, "''");

    sqlContent += `INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url) VALUES ($str$${item.name}$str$, $str$${item.country}$str$, $str$${item.region}$str$, ${item.cost_index}, ${item.popularity}, $str$${item.image_url}$str$) ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;\n`;

    // Attempt direct API insert via Supabase client if connected
    try {
      const { data: cityData, error: cityError } = await supabase
        .from('cities')
        .upsert(
          {
            name: item.name,
            country: item.country,
            region: item.region,
            cost_index: item.cost_index,
            popularity: item.popularity,
            image_url: item.image_url,
          },
          { onConflict: 'name,country' }
        )
        .select('id')
        .single();

      if (cityError) {
        console.warn(`Supabase API City Upsert Warning for ${item.name}: ${cityError.message}`);
      } else if (cityData) {
        insertedCities++;
        const cityId = cityData.id;

        for (const act of item.activities) {
          const { error: actError } = await supabase
            .from('activities')
            .upsert(
              {
                city_id: cityId,
                name: act.name,
                category: act.category,
                description: act.description,
                cost: act.cost,
                duration_minutes: act.duration_minutes,
                image_url: act.image_url,
              },
              { onConflict: 'city_id,name' }
            );

          if (!actError) insertedActivities++;
        }
      }
    } catch (err: any) {
      // Ignore API errors if running without active Supabase server
    }

    // Append activities to SQL script
    for (const act of item.activities) {
      sqlContent += `INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url) VALUES ((SELECT id FROM public.cities WHERE name = $str$${item.name}$str$ AND country = $str$${item.country}$str$ LIMIT 1), $str$${act.name}$str$, $str$${act.category}$str$, $str$${act.description}$str$, ${act.cost}, ${act.duration_minutes}, $str$${act.image_url}$str$) ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;\n`;
    }
    sqlContent += `\n`;
  }

  // Write SQL to /supabase/seed.sql
  const seedSqlPath = path.join(__dirname, '../../supabase/seed.sql');
  fs.writeFileSync(seedSqlPath, sqlContent, 'utf8');
  console.log(`✓ Generated /supabase/seed.sql successfully (${fs.statSync(seedSqlPath).size} bytes).`);

  console.log(`✓ Processed ${seedData.length} cities and ${totalActivities} activities.`);
  if (insertedCities > 0) {
    console.log(`✓ Direct API Seed Success: ${insertedCities} cities, ${insertedActivities} activities inserted.`);
  }
}

if (require.main === module) {
  runSeed().catch((err) => {
    console.error('Error running seed:', err);
    process.exit(1);
  });
}
