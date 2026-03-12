// Promotions available in all scenarios
export const promotions = [
  { id: 'social', name: 'Social Media Blast', demandMultiplier: 1.30, duration: 3, cost: 50 },
  { id: 'email', name: 'Email Campaign', demandMultiplier: 1.20, duration: 5, cost: 80 },
  { id: 'influencer', name: 'Influencer Partnership', demandMultiplier: 1.50, duration: 2, cost: 150 },
  { id: 'loyalty', name: 'Loyalty Reward', demandMultiplier: 1.15, duration: 6, cost: 60 },
];

// Discount levels available in all scenarios
export const discountLevels = [0, 5, 10, 15, 20, 25];

const scenarios = [
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    icon: '🛒',
    subtitle: 'Holiday Flash Sale',
    description:
      'Manage pricing for wireless headphones during a holiday flash sale. Maximize revenue across 30 rounds.',
    basePrice: 79,
    minPrice: 29,
    maxPrice: 149,
    initialInventory: 200,
    elasticity: 1.4,
    timeLimit: 30,
    optimalRevenue: 18000,
    demandBase: 4,
    unit: 'units',
    competitorPrices: [
      75, 74, 73, 72, 71, 69, 68, 67, 66, 65,
      64, 63, 62, 61, 90, 85, 83, 81, 79, 77,
      75, 73, 71, 69, 67, 65, 63, 61, 58, 55,
    ],
    availableBundle: { name: 'Accessory Pack', premium: 15, demandMultiplier: 1.10 },
    briefing: {
      overview:
        'You are the pricing manager for a popular online electronics retailer. Your flagship product — a premium wireless headphone set — has been selected as the star item for an upcoming holiday flash sale. The sale window spans 30 pricing rounds, and you have 200 units in stock.\n\nYour challenge is to maximize total revenue by dynamically adjusting your price throughout the sale. Demand is highly sensitive to price changes in this market — customers are comparison-shopping across multiple retailers and will quickly shift their purchasing behavior in response to even small price adjustments.\n\nChoose your pricing strategy wisely: price too high and customers will walk away; price too low and you\'ll leave money on the table.',
      competitorIntel:
        'A major competitor is expected to start their headphones at $75 and gradually lower prices throughout the sale period. Market intelligence suggests they may briefly spike prices around the midpoint of the sale.',
      hints: [
        'High elasticity (1.4) means customers are very price-sensitive — small price changes will have large effects on demand.',
        'Monitor the competitor\'s price trend and consider how your positioning relative to them affects customer perception.',
        'Consider using promotional tools strategically to boost demand during key moments of the sale.',
      ],
    },
  },
  {
    id: 'airline',
    name: 'Airline Seats',
    icon: '✈️',
    subtitle: 'Regional Flight Pricing',
    description:
      'Price a regional flight as departure approaches. Manage yield across 30 rounds with 90 seats.',
    basePrice: 180,
    minPrice: 89,
    maxPrice: 450,
    initialInventory: 90,
    elasticity: 1.1,
    timeLimit: 30,
    optimalRevenue: 38000,
    demandBase: 6,
    unit: 'seats',
    competitorPrices: [
      170, 177, 184, 192, 199, 206, 213, 221, 228, 235,
      242, 250, 257, 264, 271, 279, 286, 293, 300, 307,
      314, 322, 329, 336, 350, 350, 350, 350, 350, 350,
    ],
    availableBundle: { name: 'Checked Bag Bundle', premium: 35, demandMultiplier: 1.08 },
    briefing: {
      overview:
        'You are the revenue manager for a regional airline operating a popular route. A flight departing in 30 rounds has 90 seats remaining, and it\'s your job to maximize the revenue earned from ticket sales before departure.\n\nAirline pricing follows the principles of yield management — as departure approaches and seats become scarcer, prices typically rise. However, pricing too aggressively too early could leave you with empty seats at departure, while pricing too conservatively could mean selling premium seats at bargain prices.\n\nBalance the tension between filling the plane and maximizing per-seat revenue. Every unsold seat at departure is lost revenue forever.',
      competitorIntel:
        'A competing airline on the same route is expected to start fares at $170 and steadily increase prices as departure approaches, reaching approximately $350 in the final rounds.',
      hints: [
        'With moderate elasticity (1.1), demand responds to price changes but isn\'t as volatile as in retail markets.',
        'In yield management, timing is everything — consider raising prices as remaining inventory decreases.',
        'Watch how the competitor\'s rising prices create opportunities to capture price-sensitive travelers.',
      ],
    },
  },
  {
    id: 'hotel',
    name: 'Hotel',
    icon: '🏨',
    subtitle: 'Convention Weekend',
    description:
      'Price hotel rooms during a high-demand convention weekend. Maximize revenue across 30 rounds with 60 rooms.',
    basePrice: 180,
    minPrice: 89,
    maxPrice: 450,
    initialInventory: 60,
    elasticity: 0.9,
    timeLimit: 30,
    optimalRevenue: 28000,
    demandBase: 5,
    unit: 'rooms',
    competitorPrices: [
      175, 175, 175, 175, 175, 175, 175, 175, 175, 175,
      175, 175, 175, 175, 175, 182, 189, 196, 203, 210,
      217, 224, 231, 238, 245, 252, 259, 266, 273, 280,
    ],
    availableBundle: { name: 'Breakfast Included', premium: 25, demandMultiplier: 1.12 },
    briefing: {
      overview:
        'You are the revenue manager for a well-known hotel near a major convention center. A large industry convention is coming to town, and you have 60 rooms to sell over the 30-round event window. This is your busiest weekend of the year.\n\nHotel rooms are a perishable asset — any room unsold tonight cannot be sold tomorrow. With relatively low price elasticity, convention attendees tend to be less price-sensitive than leisure travelers, as their companies often cover accommodation costs.\n\nYour goal is to find the sweet spot between high occupancy and premium rates, capturing as much of the convention-driven demand as possible.',
      competitorIntel:
        'The competing hotel across the street is expected to hold steady at around $175 for the first half of the convention, then escalate rates sharply as availability tightens.',
      hints: [
        'Low elasticity (0.9) means demand is relatively stable — you can price higher without losing as many customers.',
        'Convention guests often book later and are less price-sensitive, creating opportunities for premium pricing.',
        'Consider bundling amenities to increase per-guest revenue without raising the base room rate.',
      ],
    },
  },
  {
    id: 'events',
    name: 'Event Tickets',
    icon: '🎵',
    subtitle: 'Summer Music Festival',
    description:
      'Sell tickets for a summer music festival. Maximize revenue across 30 rounds with 500 tickets.',
    basePrice: 120,
    minPrice: 49,
    maxPrice: 299,
    initialInventory: 500,
    elasticity: 1.6,
    timeLimit: 30,
    optimalRevenue: 57000,
    demandBase: 8,
    unit: 'tickets',
    competitorPrices: [
      110, 106, 101, 97, 92, 88, 84, 79, 75, 70,
      79, 87, 96, 105, 113, 122, 131, 139, 148, 157,
      165, 174, 183, 191, 200, 186, 172, 158, 144, 130,
    ],
    availableBundle: { name: 'VIP Experience', premium: 40, demandMultiplier: 1.05 },
    briefing: {
      overview:
        'You are the ticketing director for a highly anticipated summer music festival. With 500 tickets to sell across 30 pricing rounds, your mission is to maximize ticket revenue while ensuring strong attendance.\n\nFestival ticket pricing is uniquely challenging because demand is extremely price-sensitive. Fans actively compare prices, wait for deals, and react strongly to any perceived change in value. The market sees distinct phases: early-bird buyers looking for deals, mid-sale momentum, and last-minute purchase surges as the event approaches.\n\nNavigate these demand waves carefully to capture maximum revenue from each segment of buyers.',
      competitorIntel:
        'A rival venue\'s competing event is expected to start tickets at $110, drop prices aggressively to around $70 for early-bird promotions, then surge to $200 as their event approaches before settling near $130.',
      hints: [
        'Very high elasticity (1.6) makes this the most price-sensitive scenario — even small price increases can dramatically reduce demand.',
        'The competitor\'s pricing trajectory creates windows of opportunity when their prices are high.',
        'With 500 tickets to sell, volume matters — consider whether lower prices generating higher volume could outperform premium pricing.',
      ],
    },
  },
];

export default scenarios;
