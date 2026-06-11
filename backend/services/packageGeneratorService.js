export const generatePackages = (placeName, country) => {
  // Generate 3 packages: Budget, Family, Luxury

  const currency = country === 'India' ? '₹' : '$';
  const baseMultiplier = country === 'India' ? 7500 : 160;

  return [
    {
      _id: `pkg_budget_${Date.now()}`,
      title: `${placeName} Backpackers Budget Stay`,
      duration: '3 Days / 2 Nights',
      price: baseMultiplier * 1, // e.g. 10000 INR or 200 USD
      currency: currency,
      highlights: [
        'Budget Accommodation in Hostel/Guest House',
        'Daily Breakfast Included',
        'Group Sightseeing Tours',
        'Local Guide Assistance'
      ],
      type: 'Budget'
    },
    {
      _id: `pkg_family_${Date.now()}`,
      title: `Family Vacation to ${placeName}`,
      duration: '5 Days / 4 Nights',
      price: baseMultiplier * 3, // e.g. 30000 INR or 600 USD
      currency: currency,
      highlights: [
        'Premium 3/4-Star Hotel Stay',
        'Breakfast & Dinner Included',
        'Private Cab for Sightseeing',
        'Airport/Railway Station Transfers',
        'Kid-Friendly Activities'
      ],
      type: 'Family'
    },
    {
      _id: `pkg_luxury_${Date.now()}`,
      title: `Ultimate Luxury in ${placeName}`,
      duration: '7 Days / 6 Nights',
      price: baseMultiplier * 6, // e.g. 45000 INR or 960 USD
      currency: currency,
      highlights: [
        '5-Star Luxury Resort Stay with Private Pool',
        'All Meals (Buffet/A La Carte)',
        'Exclusive VIP Concierge',
        'Private Chauffeur-driven Luxury Car',
        'Helicopter/Yacht Ride (subject to area)',
        'Spa & Wellness Sessions'
      ],
      type: 'Luxury'
    }
  ];
};
