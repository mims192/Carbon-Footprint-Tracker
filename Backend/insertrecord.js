import { MongoClient, ObjectId } from "mongodb";

const uri = "mongodb+srv://rivx192_db_user:00VrqciYch2qdYMO@tracker.e8wjjxz.mongodb.net/?appName=tracker";
const client = new MongoClient(uri);

const userId = new ObjectId("6929b9fcc091efb900ceffca");

const categories = ["Food", "Electricity", "Waste", "Shopping", "Water","Transport"];

function randFloat(min, max, decimals = 2) {
  const val = Math.random() * (max - min) + min;
  return Number(val.toFixed(decimals));
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
  const ts = randInt(start.getTime(), end.getTime());
  return new Date(ts);
}

const septStart = new Date("2025-09-01T00:00:00Z");
const septEnd   = new Date("2025-09-30T23:59:59Z");

const octStart = new Date("2025-10-01T00:00:00Z");
const octEnd   = new Date("2025-10-31T23:59:59Z");

const novStart = new Date("2025-11-01T00:00:00Z");
const novEnd   = new Date("2025-11-28T23:59:59Z");

// NOTE: signature changed to (dateStart, dateEnd) and it uses outer `userId`
function createDoc(dateStart, dateEnd) {
  const categoriesLocal = ["Electricity", "Transport", "Food", "Waste", "Water", "Shopping"];
  const category = categoriesLocal[randInt(0, categoriesLocal.length - 1)];

  let details = {};

  if (category === "Electricity") {
    details.electricity_bill = randInt(300, 2500);
  } else if (category === "Transport") {
    details.distance_km = randFloat(1, 50);
  } else if (category === "Food") {
    details.fuel_type = ["LPG", "PNG","Induction"][randInt(0, 1)];
  } else if (category === "Waste") {
    details.weight_kg = randFloat(0.1, 5);
  } else if (category === "Water") {
    details.litres_used = randInt(50, 500);
  } else if (category === "Shopping") {
    details.item = ["Clothes", "Electronics", "Furniture","Entertainment","Groceries"][randInt(0, 2)];
  }

  const co2 = randFloat(0.5, 5.0, 3); // use 3 decimals if you want like 3.587
  const pts = randInt(10, 200);

  return {
    _id: new ObjectId(),
    userId: new ObjectId(userId),
    category,
    details,
    co2_kg: co2,
    points: pts,
    createdAt: randomDate(dateStart, dateEnd),
    __v: 0
  };
}

async function run() {
  try {
    await client.connect();
    const db = client.db("test");
    const col = db.collection("activities");

    const docs = [
      ...Array.from({ length: 16 }, () => createDoc(septStart, septEnd)),
      ...Array.from({ length: 17 }, () => createDoc(octStart, octEnd)),
      ...Array.from({ length: 17 }, () => createDoc(novStart, novEnd))
    ];

    const result = await col.insertMany(docs);
    console.log(`Inserted ${result.insertedCount} documents successfully.`);
  } catch (err) {
    console.error("Error inserting documents:", err);
  } finally {
    await client.close();
  }
}

run();
