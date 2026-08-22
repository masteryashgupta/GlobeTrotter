-- Idempotent Master Data Seed File for GlobeTrotter
-- Cities and Activities Seed Data

-- City: Paris, France
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Paris', 'France', 'Europe', 5, 99, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Paris' AND country = 'France' LIMIT 1), 'Eiffel Tower Summit Tour', 'sightseeing', 'Enjoy panoramic views of Paris from the iconic tower summit.', 35, 120, 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Paris' AND country = 'France' LIMIT 1), 'Louvre Museum Guided Walk', 'culture', 'Discover famous masterpieces including Mona Lisa and Venus de Milo.', 65, 180, 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Paris' AND country = 'France' LIMIT 1), 'Seine River Evening Cruise', 'sightseeing', 'Glide along the Seine River with live music and illuminated monuments.', 25, 90, 'https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Paris' AND country = 'France' LIMIT 1), 'Montmartre Bakery & Food Tasting', 'food', 'Sample fresh croissants, macarons, and artisanal cheeses.', 55, 150, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Nice, France
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Nice', 'France', 'Europe', 4, 85, 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Nice' AND country = 'France' LIMIT 1), 'Promenade des Anglais Stroll', 'sightseeing', 'Walk along the Mediterranean coastline in Nice.', 0, 60, 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Nice' AND country = 'France' LIMIT 1), 'Old Nice Food & Wine Walking Tour', 'food', 'Taste Socca and Riviera wines with a local guide.', 45, 120, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Nice' AND country = 'France' LIMIT 1), 'Castle Hill Viewpoint Hike', 'adventure', 'Hike up Castle Hill for sweeping views of the French Riviera.', 0, 75, 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Nice' AND country = 'France' LIMIT 1), 'Cours Saleya Flower Market Shopping', 'shopping', 'Explore colorful market stalls offering local produce and crafts.', 15, 60, 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Tokyo, Japan
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Tokyo', 'Japan', 'Asia', 4, 98, 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Tokyo' AND country = 'Japan' LIMIT 1), 'Shibuya Crossing & Harajuku Tour', 'sightseeing', 'Experience the bustling scramble crossing and pop culture streets.', 20, 150, 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Tokyo' AND country = 'Japan' LIMIT 1), 'Tsukiji Outer Market Food Tour', 'food', 'Sample fresh sushi, wagyu skewers, and tamagoyaki.', 50, 120, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Tokyo' AND country = 'Japan' LIMIT 1), 'teamLab Planets Digital Art Museum', 'culture', 'Immerse in breathtaking multi-sensory light art installations.', 28, 120, 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Tokyo' AND country = 'Japan' LIMIT 1), 'Shinjuku Golden Gai Bar Crawl', 'nightlife', 'Explore tiny atmospheric izakaya bars in historic alleys.', 60, 180, 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Kyoto, Japan
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Kyoto', 'Japan', 'Asia', 3, 94, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Kyoto' AND country = 'Japan' LIMIT 1), 'Fushimi Inari Shrine Hike', 'sightseeing', 'Walk through thousands of vibrant vermilion torii gates.', 0, 120, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Kyoto' AND country = 'Japan' LIMIT 1), 'Arashiyama Bamboo Grove Walk', 'sightseeing', 'Stroll beneath towering green bamboo stalks in western Kyoto.', 0, 60, 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Kyoto' AND country = 'Japan' LIMIT 1), 'Traditional Tea Ceremony Experience', 'culture', 'Learn the art of preparing matcha from a tea master in Gion.', 40, 90, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Kyoto' AND country = 'Japan' LIMIT 1), 'Nishiki Market Street Food Tasting', 'food', 'Discover local Kyoto delicacies along a 5-block shopping street.', 30, 90, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Rome, Italy
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Rome', 'Italy', 'Europe', 4, 97, 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Rome' AND country = 'Italy' LIMIT 1), 'Colosseum & Roman Forum Guided Access', 'culture', 'Step back in time to ancient gladiatorial arenas and temples.', 48, 180, 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Rome' AND country = 'Italy' LIMIT 1), 'Vatican Museums & Sistine Chapel Tour', 'culture', 'Admire Michelangelo frescoes and Renaissance masterpieces.', 55, 210, 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Rome' AND country = 'Italy' LIMIT 1), 'Trastevere Pasta & Gelato Masterclass', 'food', 'Make fresh carbonara and authentic Italian gelato from scratch.', 75, 150, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Rome' AND country = 'Italy' LIMIT 1), 'Trevi Fountain & Spanish Steps Night Walk', 'sightseeing', 'Stroll romantic lit piazzas and throw a coin in Trevi Fountain.', 0, 90, 'https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Florence, Italy
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Florence', 'Italy', 'Europe', 3, 91, 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Florence' AND country = 'Italy' LIMIT 1), 'Uffizi Gallery Renaissance Art Tour', 'culture', 'See Botticelli Birth of Venus and Da Vinci paintings.', 38, 150, 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Florence' AND country = 'Italy' LIMIT 1), 'Florence Duomo Dome Climb', 'adventure', 'Ascend 463 steps to the top of Brunelleschis dome.', 30, 90, 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Florence' AND country = 'Italy' LIMIT 1), 'Chianti Wine & Vineyard Tasting Trip', 'food', 'Tour Tuscan countryside wineries with cheese and olive oil pairing.', 85, 300, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Florence' AND country = 'Italy' LIMIT 1), 'San Lorenzo Leather Market Shopping', 'shopping', 'Browse handcrafted Tuscan leather jackets and bags.', 0, 90, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: New York City, USA
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('New York City', 'USA', 'North America', 5, 99, 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'New York City' AND country = 'USA' LIMIT 1), 'Statue of Liberty & Ellis Island Ferry', 'sightseeing', 'Take the ferry to Liberty Island and explore American immigration history.', 25, 240, 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'New York City' AND country = 'USA' LIMIT 1), 'Broadway Musical Show Ticket', 'culture', 'Experience world-class musical theater in the heart of Times Square.', 120, 180, 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'New York City' AND country = 'USA' LIMIT 1), 'Central Park Bike & Walking Tour', 'adventure', 'Cycle through Bethesdas Terrace, Strawberry Fields, and Bow Bridge.', 35, 120, 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'New York City' AND country = 'USA' LIMIT 1), 'Greenwich Village Pizza & Speakeasy Tour', 'food', 'Sample famous NY slice joints and hidden speakeasy bars.', 65, 150, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: San Francisco, USA
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('San Francisco', 'USA', 'North America', 5, 90, 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'San Francisco' AND country = 'USA' LIMIT 1), 'Golden Gate Bridge Cable Car Ride', 'sightseeing', 'Ride historic cable cars and cross the world-famous suspension bridge.', 15, 120, 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'San Francisco' AND country = 'USA' LIMIT 1), 'Alcatraz Island Penitentiary Tour', 'culture', 'Ferry to the maximum-security island prison with cellhouse audio tour.', 45, 210, 'https://images.unsplash.com/photo-1541464522888-898162c7754a?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'San Francisco' AND country = 'USA' LIMIT 1), 'Mission District Food & Mural Walk', 'food', 'Eat famous Mission burritos while viewing street art murals.', 40, 120, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'San Francisco' AND country = 'USA' LIMIT 1), 'Muir Woods Redwood Forest Hiking', 'adventure', 'Hike among coastal redwood trees over 1,000 years old.', 30, 240, 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: London, UK
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('London', 'UK', 'Europe', 5, 97, 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'London' AND country = 'UK' LIMIT 1), 'Tower of London & Crown Jewels', 'culture', 'Explore 900 years of royal history and inspect sparkling crowns.', 34, 150, 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'London' AND country = 'UK' LIMIT 1), 'Westminster Abbey & Big Ben Walk', 'sightseeing', 'Visit royal coronation site and iconic clock tower.', 27, 120, 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'London' AND country = 'UK' LIMIT 1), 'Borough Market Street Food Tour', 'food', 'Sample British pies, artisan cheeses, and international street treats.', 40, 90, 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'London' AND country = 'UK' LIMIT 1), 'Soho Pub Crawl & Live Music', 'nightlife', 'Visit historic West End pubs frequented by famous musicians.', 30, 180, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Edinburgh, UK
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Edinburgh', 'UK', 'Europe', 3, 88, 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Edinburgh' AND country = 'UK' LIMIT 1), 'Edinburgh Castle Tour', 'culture', 'Explore Scotland fortress atop an extinct volcanic crag.', 22, 150, 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Edinburgh' AND country = 'UK' LIMIT 1), 'Royal Mile Historic Stroll', 'sightseeing', 'Walk from castle to Holyrood Palace past cobblestone closes.', 0, 90, 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Edinburgh' AND country = 'UK' LIMIT 1), 'Scotch Whisky Experience Tasting', 'food', 'Ride a whisky barrel and taste single malts from 4 regions.', 25, 105, 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Edinburgh' AND country = 'UK' LIMIT 1), 'Arthurs Seat Summit Hike', 'adventure', 'Hike to the highest peak in Holyrood Park for panoramic views.', 0, 120, 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Bangkok, Thailand
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Bangkok', 'Thailand', 'Asia', 1, 96, 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Bangkok' AND country = 'Thailand' LIMIT 1), 'Grand Palace & Wat Phra Kaew', 'culture', 'Marvel at golden spires and the Emerald Buddha temple.', 15, 150, 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Bangkok' AND country = 'Thailand' LIMIT 1), 'Chinatown Yaowarat Midnight Food Tour', 'food', 'Taste Michelin-lauded Pad Thai, pork belly skewers, and mango sticky rice.', 25, 120, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Bangkok' AND country = 'Thailand' LIMIT 1), 'Chao Phraya Express Longtail Boat', 'sightseeing', 'Navigate Bangkoks historic canals and river networks.', 5, 60, 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Bangkok' AND country = 'Thailand' LIMIT 1), 'Chatuchak Weekend Market Shopping', 'shopping', 'Explore over 15,000 market stalls selling clothes, antiques, and spices.', 10, 180, 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Chiang Mai, Thailand
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Chiang Mai', 'Thailand', 'Asia', 1, 87, 'https://images.unsplash.com/photo-1512553353614-82a7370096dc?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Chiang Mai' AND country = 'Thailand' LIMIT 1), 'Wat Phra That Doi Suthep Temple Tour', 'culture', 'Climb 306 dragon steps to a mountain temple with city views.', 8, 150, 'https://images.unsplash.com/photo-1512553353614-82a7370096dc?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Chiang Mai' AND country = 'Thailand' LIMIT 1), 'Ethical Elephant Nature Park Sanctuary Visit', 'adventure', 'Feed, bathe, and observe rescued elephants in natural habitat.', 80, 360, 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Chiang Mai' AND country = 'Thailand' LIMIT 1), 'Northern Thai Cooking Class', 'food', 'Pick ingredients at local market and prepare Khao Soi curry.', 30, 240, 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Chiang Mai' AND country = 'Thailand' LIMIT 1), 'Chiang Mai Night Bazaar Shopping', 'shopping', 'Shop handmade silver jewelry, woodcarvings, and handicrafts.', 15, 120, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Barcelona, Spain
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Barcelona', 'Spain', 'Europe', 3, 96, 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Barcelona' AND country = 'Spain' LIMIT 1), 'Sagrada Familia Fast-Track Guided Tour', 'culture', 'Marvel at Gaudi crowning architectural masterpiece.', 32, 105, 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Barcelona' AND country = 'Spain' LIMIT 1), 'Park Guell Mosaic Gardens Stroll', 'sightseeing', 'Explore colorful mosaic benches and dragon statues overlooking Barcelona.', 14, 90, 'https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Barcelona' AND country = 'Spain' LIMIT 1), 'Gothic Quarter Tapas & Sangria Crawl', 'food', 'Sample Jamon Iberico, patatas bravas, and Spanish wines.', 45, 150, 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Barcelona' AND country = 'Spain' LIMIT 1), 'Barceloneta Beach Sunset Paddleboarding', 'adventure', 'Paddle along Barcelonas sandy coast during golden hour.', 25, 90, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Madrid, Spain
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Madrid', 'Spain', 'Europe', 3, 92, 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Madrid' AND country = 'Spain' LIMIT 1), 'Prado Museum Masterpieces Tour', 'culture', 'See iconic works by Goya, Velazquez, and El Greco.', 25, 150, 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Madrid' AND country = 'Spain' LIMIT 1), 'Royal Palace of Madrid Tour', 'culture', 'Walk through official royal reception rooms and armory.', 18, 120, 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Madrid' AND country = 'Spain' LIMIT 1), 'El Rastro Flea Market Shopping', 'shopping', 'Browse vintage clothing, antiques, and books in La Latina.', 0, 120, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Madrid' AND country = 'Spain' LIMIT 1), 'Authentic Flamenco Show with Wine', 'nightlife', 'Watch passionate dancing and live guitar at a tablao.', 35, 90, 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Sydney, Australia
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Sydney', 'Australia', 'Oceania', 4, 95, 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Sydney' AND country = 'Australia' LIMIT 1), 'Sydney Opera House Architectural Tour', 'culture', 'Step inside the world-famous UNESCO sails and theaters.', 30, 60, 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Sydney' AND country = 'Australia' LIMIT 1), 'Bondi to Coogee Coastal Walk', 'adventure', 'Scenic 6km cliffside walk passing ocean pools and beaches.', 0, 150, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Sydney' AND country = 'Australia' LIMIT 1), 'Sydney Harbour Sunset Kayak', 'adventure', 'Paddle under the Harbour Bridge as city lights turn on.', 65, 120, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Sydney' AND country = 'Australia' LIMIT 1), 'Paddy Market Seafood & Craft Shopping', 'shopping', 'Shop fresh oysters, souvenirs, and local artisan goods.', 20, 90, 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Melbourne, Australia
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Melbourne', 'Australia', 'Oceania', 4, 91, 'https://images.unsplash.com/photo-1514395462725-fb4566210144?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Melbourne' AND country = 'Australia' LIMIT 1), 'Melbourne Laneway Coffee & Street Art Tour', 'food', 'Discover hidden espresso bars and world-renowned graffiti lanes.', 35, 150, 'https://images.unsplash.com/photo-1514395462725-fb4566210144?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Melbourne' AND country = 'Australia' LIMIT 1), 'Great Ocean Road & 12 Apostles Day Trip', 'adventure', 'Drive along dramatic coastal cliffs and limestone stacks.', 95, 600, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Melbourne' AND country = 'Australia' LIMIT 1), 'Queen Victoria Market Food Tasting', 'food', 'Sample Aussie bratwurst, cheeses, and artisanal pastries.', 40, 120, 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Melbourne' AND country = 'Australia' LIMIT 1), 'Yarra River Evening Rooftop Bar Hop', 'nightlife', 'Visit trendy skyline rooftop bars along Southbank.', 50, 180, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Rio de Janeiro, Brazil
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Rio de Janeiro', 'Brazil', 'South America', 2, 93, 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Rio de Janeiro' AND country = 'Brazil' LIMIT 1), 'Christ the Redeemer & Corcovado Train', 'sightseeing', 'Ride cog train up to one of the New 7 Wonders of the World.', 30, 180, 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Rio de Janeiro' AND country = 'Brazil' LIMIT 1), 'Sugarloaf Mountain Cable Car', 'sightseeing', 'Glide above Guanabara Bay for panoramic Rio views.', 32, 120, 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Rio de Janeiro' AND country = 'Brazil' LIMIT 1), 'Copacabana Caipirinha & Beach Volleyball', 'adventure', 'Sip fresh caipirinhas and play beach sports with locals.', 15, 120, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Rio de Janeiro' AND country = 'Brazil' LIMIT 1), 'Lapa Samba Night Club Experience', 'nightlife', 'Dance to live traditional Brazilian samba and choro bands.', 25, 240, 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Sao Paulo, Brazil
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Sao Paulo', 'Brazil', 'South America', 2, 84, 'https://images.unsplash.com/photo-1543059509-6d53dabe2993?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Sao Paulo' AND country = 'Brazil' LIMIT 1), 'Paulista Avenue Culture & Museum Walk', 'culture', 'Explore MASP museum floating glass structure.', 15, 150, 'https://images.unsplash.com/photo-1543059509-6d53dabe2993?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Sao Paulo' AND country = 'Brazil' LIMIT 1), 'Mercadao Gourmet Sandwich Tasting', 'food', 'Try the famous codfish cake and stacked mortadella sandwich.', 20, 90, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Sao Paulo' AND country = 'Brazil' LIMIT 1), 'Beco do Batman Street Art Graffiti Tour', 'sightseeing', 'Walk through open-air urban art gallery alleys.', 0, 90, 'https://images.unsplash.com/photo-1514395462725-fb4566210144?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Sao Paulo' AND country = 'Brazil' LIMIT 1), 'Vila Madalena Craft Beer Bar Hop', 'nightlife', 'Sample Brazilian craft IPAs and boteco snacks.', 35, 180, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Cairo, Egypt
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Cairo', 'Egypt', 'Africa', 1, 94, 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Cairo' AND country = 'Egypt' LIMIT 1), 'Giza Pyramids & Sphinx Guided Tour', 'culture', 'Stand before the Great Pyramid of Khufu and ancient Sphinx.', 25, 240, 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Cairo' AND country = 'Egypt' LIMIT 1), 'Egyptian Museum King Tut Treasures', 'culture', 'View golden death masks and mummies of ancient pharaohs.', 18, 150, 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Cairo' AND country = 'Egypt' LIMIT 1), 'Khan el-Khalili Bazaar Shopping', 'shopping', 'Bargain for brass lanterns, perfumes, and papyrus scrolls.', 10, 120, 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Cairo' AND country = 'Egypt' LIMIT 1), 'Nile Felucca Sunset Sailing', 'adventure', 'Sail traditional wooden sailboat along the river Nile.', 20, 90, 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Luxor, Egypt
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Luxor', 'Egypt', 'Africa', 1, 89, 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Luxor' AND country = 'Egypt' LIMIT 1), 'Valley of the Kings Tombs Tour', 'culture', 'Descend into colorful pharaonic underground tombs.', 30, 210, 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Luxor' AND country = 'Egypt' LIMIT 1), 'Karnak Temple Complex Walk', 'culture', 'Walk through massive hypostyle hall of 134 giant stone pillars.', 15, 120, 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Luxor' AND country = 'Egypt' LIMIT 1), 'Sunrise Hot Air Balloon Over Luxor', 'adventure', 'Float over West Bank temples and sugarcane fields at dawn.', 85, 120, 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Luxor' AND country = 'Egypt' LIMIT 1), 'Nile River Dinner Cruise & Tanoura Dance', 'nightlife', 'Enjoy Egyptian buffet with whirling dervish performance.', 35, 180, 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Cape Town, South Africa
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Cape Town', 'South Africa', 'Africa', 2, 94, 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Cape Town' AND country = 'South Africa' LIMIT 1), 'Table Mountain Cableway Hike', 'adventure', 'Take cable car or summit Platteklip Gorge trail.', 22, 180, 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Cape Town' AND country = 'South Africa' LIMIT 1), 'Boulders Beach Penguin Colony Visit', 'sightseeing', 'Walk boardwalks alongside wild African penguins.', 12, 90, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Cape Town' AND country = 'South Africa' LIMIT 1), 'Cape Point & Good Hope Scenic Drive', 'adventure', 'Drive along Chapman Peak to dramatic southwestern tip of Africa.', 35, 360, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Cape Town' AND country = 'South Africa' LIMIT 1), 'V&A Waterfront Seafood & Craft Market', 'food', 'Dine on fresh oysters and crayfish overlooking harbour.', 40, 120, 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Dubai, UAE
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Dubai', 'UAE', 'Middle East', 5, 97, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Dubai' AND country = 'UAE' LIMIT 1), 'Burj Khalifa At the Top Observation Deck', 'sightseeing', 'Ascend to 124th floor of worlds tallest skyscraper.', 45, 90, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Dubai' AND country = 'UAE' LIMIT 1), 'Desert Safari Dune Bashing & BBQ', 'adventure', '4x4 dune bashing, camel riding, and Bedouin camp dinner.', 65, 360, 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Dubai' AND country = 'UAE' LIMIT 1), 'Dubai Mall & Fountain Show Walk', 'shopping', 'Watch choreography of light and water near luxury boutiques.', 0, 120, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Dubai' AND country = 'UAE' LIMIT 1), 'Old Dubai Gold & Spice Souk Boat Ride', 'culture', 'Cross Dubai Creek on Abra boat and browse traditional souks.', 5, 120, 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: New Delhi, India
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('New Delhi', 'India', 'Asia', 1, 91, 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'New Delhi' AND country = 'India' LIMIT 1), 'Old Delhi Rickshaw & Street Food Tour', 'food', 'Ride through Chandni Chowk sampling jalebis and parathas.', 20, 150, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'New Delhi' AND country = 'India' LIMIT 1), 'Qutub Minar & Humayun Tomb Architecture', 'culture', 'Tour UNESCO red sandstone monuments and Mughal gardens.', 12, 180, 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'New Delhi' AND country = 'India' LIMIT 1), 'Lotus Temple & India Gate Walk', 'sightseeing', 'Visit Bahai Lotus Temple and ceremonial Boulevard.', 0, 120, 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'New Delhi' AND country = 'India' LIMIT 1), 'Dilli Haat Handicraft & Regional Food Fair', 'shopping', 'Shop traditional textiles and state regional delicacies.', 5, 120, 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Mumbai, India
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Mumbai', 'India', 'Asia', 2, 90, 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Mumbai' AND country = 'India' LIMIT 1), 'Gateway of India & Colaba Stroll', 'sightseeing', 'View iconic waterfront arch and Victorian architecture.', 0, 90, 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Mumbai' AND country = 'India' LIMIT 1), 'Marine Drive Queens Necklace Sunset', 'sightseeing', 'Walk along Arabian Sea promenade at twilight.', 0, 60, 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Mumbai' AND country = 'India' LIMIT 1), 'Elephanta Caves Island Boat Trip', 'culture', 'Ferry to island cave temples dedicated to Lord Shiva.', 15, 240, 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Mumbai' AND country = 'India' LIMIT 1), 'Chowpatty Beach Pav Bhaji & Chaat', 'food', 'Taste Mumbai famous spicy Pav Bhaji and Bhel Puri.', 8, 60, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Jaipur, India
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Jaipur', 'India', 'Asia', 1, 92, 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Jaipur' AND country = 'India' LIMIT 1), 'Amber Fort Elephant Rampart Tour', 'culture', 'Explore hill fortress with courtyards and Sheesh Mahal mirror palace.', 15, 180, 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Jaipur' AND country = 'India' LIMIT 1), 'Hawa Mahal Palace of Winds Viewing', 'sightseeing', 'Photograph 953 honeycomb windows designed for royal ladies.', 5, 60, 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Jaipur' AND country = 'India' LIMIT 1), 'Johari Bazaar Block Print Textile Shopping', 'shopping', 'Shop handmade silver jewelry, pottery, and block print quilts.', 20, 120, 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Jaipur' AND country = 'India' LIMIT 1), 'Rajasthani Thali Cultural Dinner', 'food', 'Feast on Dal Baati Churma with live folk dance.', 18, 120, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Mexico City, Mexico
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Mexico City', 'Mexico', 'North America', 2, 92, 'https://images.unsplash.com/photo-1518659267384-78f59ee96259?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Mexico City' AND country = 'Mexico' LIMIT 1), 'Frida Kahlo Museum Casa Azul Visit', 'culture', 'Explore artist birthplace and vivid blue house in Coyoacan.', 18, 120, 'https://images.unsplash.com/photo-1518659267384-78f59ee96259?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Mexico City' AND country = 'Mexico' LIMIT 1), 'Teotihuacan Pyramids Day Trip', 'culture', 'Climb Pyramids of the Sun and Moon near ancient city.', 40, 300, 'https://images.unsplash.com/photo-1518659267384-78f59ee96259?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Mexico City' AND country = 'Mexico' LIMIT 1), 'Roma & Condesa Taco Crawl', 'food', 'Eat al pastor tacos, churros, and artisanal mezcal.', 35, 150, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Mexico City' AND country = 'Mexico' LIMIT 1), 'Xochimilco Trajinera Boat Fiesta', 'adventure', 'Cruise ancient Aztec canals in colorful wooden boats with mariachi.', 25, 180, 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Vancouver, Canada
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Vancouver', 'Canada', 'North America', 4, 90, 'https://images.unsplash.com/photo-1559511260-66a654ae982a?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Vancouver' AND country = 'Canada' LIMIT 1), 'Stanley Park Seawall Cycling', 'adventure', 'Bike 9km coastal path around urban rainforest.', 20, 120, 'https://images.unsplash.com/photo-1559511260-66a654ae982a?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Vancouver' AND country = 'Canada' LIMIT 1), 'Capilano Suspension Bridge Walk', 'adventure', 'Cross 137m suspension bridge over rainforest canyon.', 50, 150, 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Vancouver' AND country = 'Canada' LIMIT 1), 'Granville Island Public Market Food Tour', 'food', 'Sample wild smoked salmon, clam chowder, and donuts.', 45, 120, 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Vancouver' AND country = 'Canada' LIMIT 1), 'Gastown Steam Clock & Historic Walk', 'sightseeing', 'See iconic whistle clock and brick cobblestone streets.', 0, 60, 'https://images.unsplash.com/photo-1559511260-66a654ae982a?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Toronto, Canada
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Toronto', 'Canada', 'North America', 4, 89, 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Toronto' AND country = 'Canada' LIMIT 1), 'CN Tower EdgeWalk & Observation Deck', 'adventure', 'Walk hands-free 116 storeys above downtown ground.', 45, 90, 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Toronto' AND country = 'Canada' LIMIT 1), 'Kensington Market Bohemian Food Stroll', 'food', 'Taste Jamaican patties, empanadas, and craft brews.', 35, 120, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Toronto' AND country = 'Canada' LIMIT 1), 'Toronto Islands Ferry & Sunset View', 'sightseeing', 'Ferry across Lake Ontario for iconic city skyline views.', 10, 180, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Toronto' AND country = 'Canada' LIMIT 1), 'Distillery Historic District Shopping', 'shopping', 'Browse Victorian industrial brick buildings with galleries.', 0, 90, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Berlin, Germany
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Berlin', 'Germany', 'Europe', 3, 93, 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Berlin' AND country = 'Germany' LIMIT 1), 'Brandenburg Gate & Reichstag Dome', 'sightseeing', 'Visit historic reunification gate and glass dome parliament.', 0, 120, 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Berlin' AND country = 'Germany' LIMIT 1), 'East Side Gallery Wall Murals Walk', 'culture', 'Walk longest remaining section of Berlin Wall art.', 0, 90, 'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Berlin' AND country = 'Germany' LIMIT 1), 'Currywurst & Craft Beer Tasting', 'food', 'Sample iconic sausage dish with spicy tomato curry sauce.', 15, 60, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Berlin' AND country = 'Germany' LIMIT 1), 'Kreuzberg Techno & Underground Nightlife', 'nightlife', 'Experience famous electronic dance music club culture.', 25, 240, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Munich, Germany
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Munich', 'Germany', 'Europe', 4, 90, 'https://images.unsplash.com/photo-1595867818082-083862f3d630?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Munich' AND country = 'Germany' LIMIT 1), 'Marienplatz & Glockenspiel Chime Show', 'sightseeing', 'Watch motorized figurines dance in town hall tower.', 0, 60, 'https://images.unsplash.com/photo-1595867818082-083862f3d630?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Munich' AND country = 'Germany' LIMIT 1), 'Hofbrauhaus Bavarian Beer Hall Dinner', 'food', 'Sip one-liter beer steins with pretzels and pork knuckle.', 35, 150, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Munich' AND country = 'Germany' LIMIT 1), 'Neuschwanstein Castle Day Excursion', 'culture', 'Tour fairy-tale castle nestled in Bavarian Alps.', 65, 480, 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Munich' AND country = 'Germany' LIMIT 1), 'English Garden River Surfing Watching', 'adventure', 'Watch surfers ride Eisbach standing wave in public park.', 0, 60, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Bali, Indonesia
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Bali', 'Indonesia', 'Asia', 1, 98, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Bali' AND country = 'Indonesia' LIMIT 1), 'Tegallalang Rice Terrace & Jungle Swing', 'adventure', 'Swing high over lush green terraced valley in Ubud.', 15, 120, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Bali' AND country = 'Indonesia' LIMIT 1), 'Uluwatu Sunset Temple & Kecak Fire Dance', 'culture', 'Watch traditional chanting performance on cliff edge.', 12, 150, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Bali' AND country = 'Indonesia' LIMIT 1), 'Mount Batur Sunrise Volcano Trek', 'adventure', 'Hike active volcano at dawn for breakfast above clouds.', 45, 360, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Bali' AND country = 'Indonesia' LIMIT 1), 'Canggu Beachfront Sunset Cocktail', 'nightlife', 'Relax at beach club with tropical cocktails and beats.', 20, 180, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Amsterdam, Netherlands
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Amsterdam', 'Netherlands', 'Europe', 4, 95, 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Amsterdam' AND country = 'Netherlands' LIMIT 1), 'Rijksmuseum Golden Age Art Tour', 'culture', 'See Rembrandts Night Watch and Vermeers Milkmaid.', 25, 150, 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Amsterdam' AND country = 'Netherlands' LIMIT 1), 'Historic Canal Belt Open Boat Cruise', 'sightseeing', 'Cruise UNESCO canals with cheese and Dutch stroopwafels.', 22, 75, 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Amsterdam' AND country = 'Netherlands' LIMIT 1), 'Van Gogh Museum Life & Art Tour', 'culture', 'Explore largest collection of Van Gogh paintings and letters.', 24, 120, 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Amsterdam' AND country = 'Netherlands' LIMIT 1), 'Jordaan District Boutique Shopping', 'shopping', 'Browse narrow streets filled with vintage shops and cafes.', 0, 120, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Singapore, Singapore
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Singapore', 'Singapore', 'Asia', 5, 95, 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Singapore' AND country = 'Singapore' LIMIT 1), 'Gardens by the Bay Supertree Grove', 'sightseeing', 'Walk OCBC Skyway among giant futuristic solar supertrees.', 14, 120, 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Singapore' AND country = 'Singapore' LIMIT 1), 'Marina Bay Sands Skypark Deck', 'sightseeing', 'View Singapore skyline 57 storeys up above Marina Bay.', 26, 90, 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Singapore' AND country = 'Singapore' LIMIT 1), 'Lau Pa Sat Hawker Center Dinner', 'food', 'Taste Hainanese chicken rice, satay, and laksa noodle soup.', 15, 90, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Singapore' AND country = 'Singapore' LIMIT 1), 'Chinatown & Little India Heritage Walk', 'culture', 'Explore colorful temples, spice shops, and heritage shophouses.', 0, 150, 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Istanbul, Turkey
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Istanbul', 'Turkey', 'Europe', 2, 95, 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Istanbul' AND country = 'Turkey' LIMIT 1), 'Hagia Sophia & Blue Mosque Guided Tour', 'culture', 'Marvel at Byzantine domes and intricate Ottoman tilework.', 25, 150, 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Istanbul' AND country = 'Turkey' LIMIT 1), 'Grand Bazaar & Spice Market Shopping', 'shopping', 'Navigate over 4,000 shops selling rugs, teas, and ceramics.', 10, 180, 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Istanbul' AND country = 'Turkey' LIMIT 1), 'Bosphorus Strait Cruise Between Continents', 'sightseeing', 'Sail between Europe and Asia past palaces and fortresses.', 15, 120, 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Istanbul' AND country = 'Turkey' LIMIT 1), 'Karakoy Baklava & Turkish Coffee Tasting', 'food', 'Taste layered pistachio baklava paired with charcoal-brewed coffee.', 12, 60, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Cappadocia, Turkey
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Cappadocia', 'Turkey', 'Asia', 2, 92, 'https://images.unsplash.com/photo-1609825488888-3a766db05542?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Cappadocia' AND country = 'Turkey' LIMIT 1), 'Sunrise Hot Air Balloon Flight', 'adventure', 'Float over fairy chimneys and carved rock valleys at sunrise.', 180, 150, 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Cappadocia' AND country = 'Turkey' LIMIT 1), 'Goreme Open Air Museum Rock Churches', 'culture', 'Explore UNESCO cave churches painted with ancient frescoes.', 15, 120, 'https://images.unsplash.com/photo-1609825488888-3a766db05542?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Cappadocia' AND country = 'Turkey' LIMIT 1), 'Derinkuyu Underground City Hike', 'adventure', 'Descend 8 levels into ancient multi-story underground city.', 12, 90, 'https://images.unsplash.com/photo-1609825488888-3a766db05542?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Cappadocia' AND country = 'Turkey' LIMIT 1), 'Traditional Anatolian Pottery Workshop', 'other', 'Try throwing clay on kick-wheel with Avanos pottery masters.', 20, 90, 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Seoul, South Korea
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Seoul', 'South Korea', 'Asia', 3, 95, 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Seoul' AND country = 'South Korea' LIMIT 1), 'Gyeongbokgung Palace Hanbok Tour', 'culture', 'Wear traditional Hanbok dress to tour royal palace grounds.', 15, 150, 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Seoul' AND country = 'South Korea' LIMIT 1), 'Myeongdong K-Beauty & Street Food Stroll', 'shopping', 'Shop skincare products and eat Korean fried chicken & tteokbokki.', 30, 120, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Seoul' AND country = 'South Korea' LIMIT 1), 'N Seoul Tower Cable Car View', 'sightseeing', 'Ascend Namsan mountain for panoramic Seoul city views.', 12, 90, 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Seoul' AND country = 'South Korea' LIMIT 1), 'Hongdae Indie Music & Nightlife Crawl', 'nightlife', 'Experience student street busking and youth club culture.', 25, 180, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Buenos Aires, Argentina
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Buenos Aires', 'Argentina', 'South America', 2, 89, 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Buenos Aires' AND country = 'Argentina' LIMIT 1), 'La Boca Caminito Colorful Walk', 'sightseeing', 'Photograph street performers and painted wooden houses.', 0, 90, 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Buenos Aires' AND country = 'Argentina' LIMIT 1), 'Palermo Asado Steak & Malbec Wine Dinner', 'food', 'Savor traditional Argentine grilled beef and red wine.', 40, 180, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Buenos Aires' AND country = 'Argentina' LIMIT 1), 'Tango Show & Dance Workshop in San Telmo', 'culture', 'Watch world-class dancers and take beginner tango steps.', 45, 150, 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Buenos Aires' AND country = 'Argentina' LIMIT 1), 'Recoleto Cemetery Historic Architecture', 'culture', 'Visit mausoleums of historical figures including Evita Peron.', 8, 90, 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Athens, Greece
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Athens', 'Greece', 'Europe', 3, 93, 'https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Athens' AND country = 'Greece' LIMIT 1), 'Acropolis & Parthenon Ancient Ruins Tour', 'culture', 'Walk around 5th-century BC temples atop rocky citadel.', 20, 150, 'https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Athens' AND country = 'Greece' LIMIT 1), 'Plaka District Souvlaki & Wine Walk', 'food', 'Eat gyro skewers and tzatziki under lit ruins.', 25, 120, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Athens' AND country = 'Greece' LIMIT 1), 'Acropolis Museum Glass Floor Walk', 'culture', 'View ancient artifacts excavated directly beneath museum site.', 15, 120, 'https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Athens' AND country = 'Greece' LIMIT 1), 'Monastiraki Flea Market Antique Shopping', 'shopping', 'Shop Greek leather sandals, icons, and copperware.', 10, 90, 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Santorini, Greece
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Santorini', 'Greece', 'Europe', 5, 97, 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Santorini' AND country = 'Greece' LIMIT 1), 'Oia Sunset Blue Dome Viewpoint Walk', 'sightseeing', 'Photograph iconic white whitewashed houses and blue domes.', 0, 90, 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Santorini' AND country = 'Greece' LIMIT 1), 'Santorini Caldera Catamaran Cruise', 'adventure', 'Sail volcanic caldera with snorkeling at Red Beach and BBQ.', 110, 300, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Santorini' AND country = 'Greece' LIMIT 1), 'Volcanic Assyrtiko Wine Tasting', 'food', 'Sample crisp white wines grown in basket-trained vines.', 45, 120, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Santorini' AND country = 'Greece' LIMIT 1), 'Fira to Oia Cliffside Hike', 'adventure', 'Hike 10km trail along volcanic crater edge.', 0, 210, 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Hanoi, Vietnam
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Hanoi', 'Vietnam', 'Asia', 1, 91, 'https://images.unsplash.com/photo-1509030450996-93f2e3d8ed05?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Hanoi' AND country = 'Vietnam' LIMIT 1), 'Old Quarter Egg Coffee & Pho Tour', 'food', 'Sip rich creamy egg coffee and authentic beef Pho.', 15, 120, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Hanoi' AND country = 'Vietnam' LIMIT 1), 'Ha Long Bay Overnight Cruise Excursion', 'adventure', 'Kayak through limestone karsts and emerald waters.', 120, 1440, 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Hanoi' AND country = 'Vietnam' LIMIT 1), 'Hoan Kiem Lake & Ngoc Son Temple', 'sightseeing', 'Stroll around peaceful lake in historic city center.', 2, 60, 'https://images.unsplash.com/photo-1509030450996-93f2e3d8ed05?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Hanoi' AND country = 'Vietnam' LIMIT 1), 'Thang Long Water Puppet Show', 'culture', 'Watch traditional Vietnamese folk tales performed on water stage.', 8, 60, 'https://images.unsplash.com/photo-1509030450996-93f2e3d8ed05?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Cusco, Peru
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Cusco', 'Peru', 'South America', 2, 94, 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Cusco' AND country = 'Peru' LIMIT 1), 'Machu Picchu Citadel Guided Tour', 'culture', 'Explore iconic 15th-century Inca sanctuary in cloud forest.', 90, 360, 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Cusco' AND country = 'Peru' LIMIT 1), 'Sacred Valley Pisac Market & Fortress', 'adventure', 'Visit Andean terraced ruins and artisan craft market.', 35, 300, 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Cusco' AND country = 'Peru' LIMIT 1), 'Rainbow Mountain Vinicunca Trek', 'adventure', 'Challenge high altitude hike to 5,200m striped mineral mountain.', 45, 600, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Cusco' AND country = 'Peru' LIMIT 1), 'San Pedro Market Ceviche & Cocoa Tasting', 'food', 'Sample fresh trout ceviche and coca leaf tea.', 10, 90, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Marrakech, Morocco
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Marrakech', 'Morocco', 'Africa', 2, 93, 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Marrakech' AND country = 'Morocco' LIMIT 1), 'Jemaa el-Fnaa Night Market & Storytellers', 'sightseeing', 'Experience vibrant square with snake charmers and food stalls.', 0, 120, 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Marrakech' AND country = 'Morocco' LIMIT 1), 'Medina Souks Leather & Spice Shopping', 'shopping', 'Bargain for Moroccan lamps, babouche slippers, and argan oil.', 15, 180, 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Marrakech' AND country = 'Morocco' LIMIT 1), 'Jardin Majorelle & Yves Saint Laurent Museum', 'culture', 'Stroll electric blue botanical gardens designed by Jacques Majorelle.', 16, 90, 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Marrakech' AND country = 'Morocco' LIMIT 1), 'Traditional Hammam Spa & Massage', 'other', 'Relax in steam bath with black soap scrub and argan massage.', 35, 120, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Lisbon, Portugal
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Lisbon', 'Portugal', 'Europe', 3, 94, 'https://images.unsplash.com/photo-1509839862600-e09c574472f7?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Lisbon' AND country = 'Portugal' LIMIT 1), 'Tram 28 Historic Neighborhood Ride', 'sightseeing', 'Ride yellow vintage tram through Alfama and Graca hills.', 3, 60, 'https://images.unsplash.com/photo-1509839862600-e09c574472f7?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Lisbon' AND country = 'Portugal' LIMIT 1), 'Belem Tower & Pastel de Nata Tasting', 'food', 'Eat warm custard tarts at Pasteis de Belem after tower visit.', 12, 120, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Lisbon' AND country = 'Portugal' LIMIT 1), 'Sintra Peña Palace Day Trip', 'culture', 'Explore romantic fairy-tale yellow and red palace in Sintra hills.', 40, 360, 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Lisbon' AND country = 'Portugal' LIMIT 1), 'Bairro Alto Fado Evening Dinner', 'nightlife', 'Listen to melancholic guitar fado music while enjoying codfish.', 35, 180, 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Prague, Czech Republic
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Prague', 'Czech Republic', 'Europe', 2, 93, 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Prague' AND country = 'Czech Republic' LIMIT 1), 'Charles Bridge & Old Town Astronomical Clock', 'sightseeing', 'Walk iconic statue-lined bridge and see hourly mechanical show.', 0, 90, 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Prague' AND country = 'Czech Republic' LIMIT 1), 'Prague Castle & St. Vitus Cathedral Tour', 'culture', 'Explore vast 9th-century castle complex and gothic cathedral.', 16, 180, 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Prague' AND country = 'Czech Republic' LIMIT 1), 'Pilsner Czech Beer Tasting & Cellar Walk', 'food', 'Sample unpasteurized Czech lagers in underground cellars.', 20, 120, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Prague' AND country = 'Czech Republic' LIMIT 1), 'Vltava River Sunset Pedal Boat Rental', 'adventure', 'Rent swan pedal boat for views of Prague castle skyline.', 15, 60, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Vienna, Austria
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Vienna', 'Austria', 'Europe', 4, 91, 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Vienna' AND country = 'Austria' LIMIT 1), 'Schonbrunn Palace & Imperial Gardens', 'culture', 'Tour summer residence of Habsburg monarchs and maze.', 24, 180, 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Vienna' AND country = 'Austria' LIMIT 1), 'Viennese Coffeehouse Sacher Torte Tasting', 'food', 'Sip Melange coffee with original chocolate Sachertorte cake.', 18, 75, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Vienna' AND country = 'Austria' LIMIT 1), 'Belvedere Palace Klimt Kiss Art Tour', 'culture', 'View Gustav Klimt famous golden painting The Kiss.', 19, 120, 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Vienna' AND country = 'Austria' LIMIT 1), 'Vienna State Opera House Guided Tour', 'culture', 'Inspect marble staircases and auditorium of famous opera.', 13, 60, 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Zurich, Switzerland
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Zurich', 'Switzerland', 'Europe', 5, 88, 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Zurich' AND country = 'Switzerland' LIMIT 1), 'Lake Zurich Scenic Boat Cruise', 'sightseeing', 'Glide past alpine hamlets with views of snowcapped peaks.', 30, 90, 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Zurich' AND country = 'Switzerland' LIMIT 1), 'Lindt Home of Chocolate Interactive Museum', 'food', 'Marvel at 9m chocolate fountain and sample Swiss pralines.', 17, 120, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Zurich' AND country = 'Switzerland' LIMIT 1), 'Uetliberg Mountain Viewpoint Train', 'adventure', 'Take train up Zurich local mountain for panoramic city view.', 20, 120, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Zurich' AND country = 'Switzerland' LIMIT 1), 'Bahnhofstrasse Luxury Window Shopping', 'shopping', 'Stroll one of the world most exclusive shopping avenues.', 0, 90, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Auckland, New Zealand
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Auckland', 'New Zealand', 'Oceania', 4, 87, 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Auckland' AND country = 'New Zealand' LIMIT 1), 'Auckland Sky Tower Deck & SkyWalk', 'adventure', 'View 360-degree vistas 220 meters above city level.', 28, 90, 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Auckland' AND country = 'New Zealand' LIMIT 1), 'Waiheke Island Wine Tasting Ferry', 'food', 'Ferry to island known for boutique vineyards and olive groves.', 75, 360, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Auckland' AND country = 'New Zealand' LIMIT 1), 'Rangitoto Island Volcanic Summit Hike', 'adventure', 'Hike through lava fields to volcanic cone summit.', 35, 240, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Auckland' AND country = 'New Zealand' LIMIT 1), 'Viaduct Harbour Dinner & Cocktails', 'nightlife', 'Dine at waterfront restaurants overlooking luxury yachts.', 50, 150, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Antalya, Turkey
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Antalya', 'Turkey', 'Europe', 2, 86, 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Antalya' AND country = 'Turkey' LIMIT 1), 'Kaleiçi Old Town Historic Walk', 'sightseeing', 'Stroll Ottoman-era cobblestone streets down to ancient harbor.', 0, 90, 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Antalya' AND country = 'Turkey' LIMIT 1), 'Duden Waterfalls Boat Tour', 'adventure', 'Watch freshwater cascades plunge directly into Mediterranean sea.', 20, 120, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Antalya' AND country = 'Turkey' LIMIT 1), 'Hadrians Gate Roman Monument', 'culture', 'Inspect 2nd-century triple-arched marble triumphal arch.', 0, 45, 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Antalya' AND country = 'Turkey' LIMIT 1), 'Lara Beach Sunset Resort Relaxation', 'sightseeing', 'Relax on golden sands with beachside drinks.', 10, 180, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Manila, Philippines
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Manila', 'Philippines', 'Asia', 1, 82, 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Manila' AND country = 'Philippines' LIMIT 1), 'Intramuros Walled City Kalesa Ride', 'culture', 'Tour Spanish colonial era fortress in horse-drawn carriage.', 10, 120, 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Manila' AND country = 'Philippines' LIMIT 1), 'Binondo Oldest Chinatown Food Crawl', 'food', 'Sample lumpia, pork buns, and halo-halo shaved ice dessert.', 15, 120, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Manila' AND country = 'Philippines' LIMIT 1), 'Manila Bay Sunset Promenade Walk', 'sightseeing', 'Watch world-famous Manila Bay golden hour sunset.', 0, 60, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Manila' AND country = 'Philippines' LIMIT 1), 'BGC Bonifacio Global City Nightlife', 'nightlife', 'Explore modern high-end cocktail lounges and microbreweries.', 30, 180, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Kuala Lumpur, Malaysia
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Kuala Lumpur', 'Malaysia', 'Asia', 1, 90, 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Kuala Lumpur' AND country = 'Malaysia' LIMIT 1), 'Petronas Twin Towers Skybridge Visit', 'sightseeing', 'Cross glass bridge 170m above ground between twin towers.', 22, 90, 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Kuala Lumpur' AND country = 'Malaysia' LIMIT 1), 'Batu Caves Lord Murugan Shrine Climb', 'culture', 'Climb 272 rainbow steps into massive limestone cave temple.', 0, 120, 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Kuala Lumpur' AND country = 'Malaysia' LIMIT 1), 'Jalan Alor Night Market Food Feast', 'food', 'Eat grilled chicken wings, char kway teow, and durian.', 15, 90, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Kuala Lumpur' AND country = 'Malaysia' LIMIT 1), 'Central Market Batik & Craft Shopping', 'shopping', 'Shop handmade Malaysian batik shirts and pewter souvenirs.', 15, 90, 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Budapest, Hungary
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Budapest', 'Hungary', 'Europe', 2, 92, 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Budapest' AND country = 'Hungary' LIMIT 1), 'Szechenyi Thermal Bath Relaxation', 'other', 'Soak in medicinal natural hot spring waters in outdoor palace pool.', 28, 180, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Budapest' AND country = 'Hungary' LIMIT 1), 'Fishermans Bastion & Buda Castle Walk', 'sightseeing', 'Take panoramic photos of Parliament across Danube river.', 0, 120, 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Budapest' AND country = 'Hungary' LIMIT 1), 'Szimpla Kert Ruin Bar Drink', 'nightlife', 'Drink craft beer inside famous converted abandoned building pub.', 10, 150, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Budapest' AND country = 'Hungary' LIMIT 1), 'Danube River Illuminated Night Cruise', 'sightseeing', 'Sail past lit Hungarian parliament with glass of champagne.', 22, 75, 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Oslo, Norway
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Oslo', 'Norway', 'Europe', 5, 86, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Oslo' AND country = 'Norway' LIMIT 1), 'Oslo Opera House Roof Walk', 'sightseeing', 'Walk directly on marble roof sloping into Oslo fjord.', 0, 60, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Oslo' AND country = 'Norway' LIMIT 1), 'Munch Museum Scream Artwork Tour', 'culture', 'View Edvard Munch iconic Expressionist painting The Scream.', 18, 120, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Oslo' AND country = 'Norway' LIMIT 1), 'Vigeland Sculpture Park Stroll', 'culture', 'Explore over 200 granite and bronze human sculptures.', 0, 90, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Oslo' AND country = 'Norway' LIMIT 1), 'Fjord Electric Boat Tour', 'adventure', 'Silent zero-emission cruise through Oslofjord islands.', 40, 120, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Dublin, Ireland
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Dublin', 'Ireland', 'Europe', 4, 90, 'https://images.unsplash.com/photo-1549918864-48ac978761a4?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Dublin' AND country = 'Ireland' LIMIT 1), 'Guinness Storehouse Experience & Gravity Bar', 'food', 'Learn brewing history and enjoy pint with 360 city view.', 28, 120, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Dublin' AND country = 'Ireland' LIMIT 1), 'Trinity College & Book of Kells Exhibition', 'culture', 'View 9th-century illuminated Gospel manuscript in Long Room.', 19, 90, 'https://images.unsplash.com/photo-1549918864-48ac978761a4?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Dublin' AND country = 'Ireland' LIMIT 1), 'Temple Bar Live Irish Music Crawl', 'nightlife', 'Listen to fiddle and bodhran players in cobbled pub quarter.', 20, 180, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Dublin' AND country = 'Ireland' LIMIT 1), 'Cliffs of Moher Day Tour', 'adventure', 'Excursion to 214m vertical Atlantic sea cliffs.', 75, 600, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Stockholm, Sweden
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Stockholm', 'Sweden', 'Europe', 4, 89, 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Stockholm' AND country = 'Sweden' LIMIT 1), 'Vasa Museum 17th Century Warship', 'culture', 'View remarkably preserved 1628 royal warship salvaged from harbor.', 20, 120, 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Stockholm' AND country = 'Sweden' LIMIT 1), 'Gamla Stan Old Town Cobblestone Walk', 'sightseeing', 'Explore narrow medieval alleys and royal palace guard change.', 0, 90, 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Stockholm' AND country = 'Sweden' LIMIT 1), 'Swedish Fika Coffee & Cinnamon Bun Tasting', 'food', 'Enjoy traditional Fika break with cardamom & cinnamon buns.', 12, 60, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Stockholm' AND country = 'Sweden' LIMIT 1), 'Stockholm Archipelago Island Hopping', 'adventure', 'Ferry across 30,000 island archipelago for nature walks.', 35, 300, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Busan, South Korea
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Busan', 'South Korea', 'Asia', 2, 88, 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Busan' AND country = 'South Korea' LIMIT 1), 'Gamcheon Culture Village Pastel Walk', 'sightseeing', 'Walk hillside village known as the Santorini of Korea.', 0, 120, 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Busan' AND country = 'South Korea' LIMIT 1), 'Haeundae Beach & Blue Line Park Capsule Train', 'adventure', 'Ride retro coastal train above ocean cliffs.', 16, 90, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Busan' AND country = 'South Korea' LIMIT 1), 'Jagalchi Seafood Market Raw Fish Tasting', 'food', 'Pick fresh seafood downstairs and eat it prepared upstairs.', 30, 90, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Busan' AND country = 'South Korea' LIMIT 1), 'Haedong Yonggungsa Seaside Temple', 'culture', 'Visit rare coastal Buddhist temple built on ocean rocks.', 0, 90, 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

-- City: Santiago, Chile
INSERT INTO public.cities (name, country, region, cost_index, popularity, image_url)
VALUES ('Santiago', 'Chile', 'South America', 3, 85, 'https://images.unsplash.com/photo-1518659267384-78f59ee96259?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (name, country) DO UPDATE SET cost_index = EXCLUDED.cost_index, popularity = EXCLUDED.popularity, image_url = EXCLUDED.image_url;

INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Santiago' AND country = 'Chile' LIMIT 1), 'San Cristobal Hill Funicular & Statue', 'sightseeing', 'Ride funicular for views of Santiago backed by Andes mountains.', 6, 120, 'https://images.unsplash.com/photo-1518659267384-78f59ee96259?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Santiago' AND country = 'Chile' LIMIT 1), 'Maipo Valley Cabernet Sauvignon Winery Tour', 'food', 'Tour historical vineyards at the foot of the Andes.', 55, 240, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Santiago' AND country = 'Chile' LIMIT 1), 'Lastarria & Bellavista Neighborhood Walk', 'culture', 'Explore bohemian street art cafes and Pablo Neruda home.', 12, 150, 'https://images.unsplash.com/photo-1518659267384-78f59ee96259?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;
INSERT INTO public.activities (city_id, name, category, description, cost, duration_minutes, image_url)
VALUES ((SELECT id FROM public.cities WHERE name = 'Santiago' AND country = 'Chile' LIMIT 1), 'Mercado Central Seafood Empanada Lunch', 'food', 'Try king crab and fried fish empanadas in historic iron market.', 20, 90, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (city_id, name) DO UPDATE SET cost = EXCLUDED.cost, duration_minutes = EXCLUDED.duration_minutes;

