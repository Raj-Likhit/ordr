const fetch = require('node-fetch'); // fallback if needed, but native fetch works in node 18+

const candidates = [
  {
    title: "Handwoven Linen Shirt",
    urls: [
      "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c",
      "https://images.unsplash.com/photo-1604044955745-f076c8c9e5cd",
      "https://images.unsplash.com/photo-1598554889165-8139a49f2883"
    ]
  },
  {
    title: "Brass Pendant Lamp",
    urls: [
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15",
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c",
      "https://images.unsplash.com/photo-1540932239986-30128078f3f5"
    ]
  },
  {
    title: "Artisan Ceramic Mug",
    urls: [
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d",
      "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd",
      "https://images.unsplash.com/photo-1534073133331-c4b62a557083"
    ]
  },
  {
    title: "Organic Lavender Soap",
    urls: [
      "https://images.unsplash.com/photo-1600857062241-98e5dba7f214",
      "https://images.unsplash.com/photo-1611078519183-f27ebaa8abf4",
      "https://images.unsplash.com/photo-1584824388147-3bd427137f65"
    ]
  },
  {
    title: "Woven Rattan Basket",
    urls: [
      "https://images.unsplash.com/photo-1590736969955-71cc94801759",
      "https://images.unsplash.com/photo-1585055006622-cddb123d46cb",
      "https://images.unsplash.com/photo-1610385802271-e945c5c06d02"
    ]
  },
  {
    title: "Minimalist Leather Wallet",
    urls: [
      "https://images.unsplash.com/photo-1627384113743-6bd5a479fffd",
      "https://images.unsplash.com/photo-1628151015968-3a4429e9ef04",
      "https://images.unsplash.com/photo-1559905206-eb836cdcb28e"
    ]
  },
  {
    title: "Beeswax Pillar Candle",
    urls: [
      "https://images.unsplash.com/photo-1602927807750-f80e608034db",
      "https://images.unsplash.com/photo-1603006905393-27471249b5c3",
      "https://images.unsplash.com/photo-1580225150864-4e4f553f19e4"
    ]
  },
  {
    title: "Matte Black French Press",
    urls: [
      "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7",
      "https://images.unsplash.com/photo-1585805829671-5582fcc02dd2",
      "https://images.unsplash.com/photo-1594910243454-9ee02fca6650"
    ]
  },
  {
    title: "Olive Wood Cutting Board",
    urls: [
      "https://images.unsplash.com/photo-1615486171448-4fb659f1396a",
      "https://images.unsplash.com/photo-1597348989645-46b190ce4918",
      "https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd"
    ]
  },
  {
    title: "Terracotta Plant Pot",
    urls: [
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411",
      "https://images.unsplash.com/photo-1509315570853-eb4fc6b633cd",
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f"
    ]
  },
  {
    title: "Chunky Knit Wool Blanket",
    urls: [
      "https://images.unsplash.com/photo-1584306351025-2ab1eeb00645",
      "https://images.unsplash.com/photo-1580226999252-9bc5f5c35fce",
      "https://images.unsplash.com/photo-1522771930-78848d926053"
    ]
  },
  {
    title: "Rose Quartz Face Roller",
    urls: [
      "https://images.unsplash.com/photo-1615397323671-b0dbac75ecf2",
      "https://images.unsplash.com/photo-1596755389378-c31d21fd1273",
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908"
    ]
  }
];

async function run() {
  const finalResults = {};
  for (const item of candidates) {
    let found = null;
    for (const url of item.urls) {
      try {
        const res = await fetch(url + '?w=800&q=80', { method: 'HEAD' });
        if (res.ok) {
          found = url;
          break;
        }
      } catch (e) {}
    }
    finalResults[item.title] = found || "NONE";
    console.log(item.title, ":", found);
  }
}
run();
