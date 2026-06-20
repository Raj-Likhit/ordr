const fs = require('fs');

async function getUnsplashId(query) {
  try {
    const res = await fetch(`https://unsplash.com/ngetty/v3/search/photos?query=${encodeURIComponent(query)}&per_page=1`);
    if (!res.ok) {
       console.log("Failed", query, res.status);
       return null;
    }
    const data = await res.json();
    if (data && data.results && data.results.length > 0) {
      return data.results[0].id;
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

async function run() {
  const queries = [
    "Handwoven Linen Shirt",
    "Brass Pendant Lamp",
    "Artisan Ceramic Mug",
    "Organic Lavender Soap",
    "Woven Rattan Basket",
    "Minimalist Leather Wallet",
    "Beeswax Pillar Candle",
    "Matte Black French Press",
    "Olive Wood Cutting Board",
    "Terracotta Plant Pot",
    "Chunky Knit Wool Blanket",
    "Rose Quartz Face Roller"
  ];
  const results = {};
  for (const q of queries) {
    const id = await getUnsplashId(q);
    results[q] = id;
    console.log(q, ":", id);
  }
}
run();
