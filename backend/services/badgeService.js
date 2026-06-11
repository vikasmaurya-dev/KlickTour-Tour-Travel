// Utility to auto-assign priority badges to packages
// Priority order: Trending > New Launch > Luxury > Best Value > Eco Friendly > Honeymoon Pick > Family Friendly

export const autoAssignBadge = (pkg, allPackagesInCategory = []) => {
  // Calculate Best Value criteria
  // Best Value -> (inclusions.length >= 4) AND price is in bottom 20% of packages in same category
  let isBestValue = false;
  if (pkg.inclusions && pkg.inclusions.length >= 4 && allPackagesInCategory.length > 0) {
    const prices = allPackagesInCategory.map(p => p.price).sort((a, b) => a - b);
    const bottom20Index = Math.floor(prices.length * 0.2);
    if (pkg.price <= prices[bottom20Index]) {
      isBestValue = true;
    }
  }

  // Calculate New Launch criteria
  // New Launch -> createdAt within last 30 days
  let isNewLaunch = false;
  if (pkg.createdAt) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (new Date(pkg.createdAt) >= thirtyDaysAgo) {
      isNewLaunch = true;
    }
  } else {
    // If it's being created right now, it is a new launch
    isNewLaunch = true;
  }

  // Calculate Trending criteria
  // Trending -> views > 500 (Assuming views is a total counter, we can just check > 500 for simplicity)
  const isTrending = pkg.views && pkg.views > 500;

  // Determine the badge based on priority
  if (isTrending) {
    return "Trending";
  }
  if (isNewLaunch) {
    return "New Launch";
  }
  if (pkg.comfortLevel === "Luxury") {
    return "Luxury";
  }
  if (isBestValue) {
    return "Best Value";
  }
  if (pkg.isEcoFriendly) {
    return "Eco Friendly";
  }
  if (pkg.groupType && pkg.groupType.includes("Couple") && pkg.category && pkg.category.toLowerCase() === "honeymoon") {
    return "Honeymoon Pick";
  }
  if (pkg.groupType && pkg.groupType.includes("Family")) {
    return "Family Friendly";
  }

  return null; // No badge
};
