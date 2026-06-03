const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/scholarbee').then(async () => {
  const coll = mongoose.connection.collection('impressions');
  const pos = await coll.countDocuments({ label: 1 });
  const neg = await coll.countDocuments({ label: 0 });
  const total = await coll.countDocuments({ label: { $ne: null } });
  console.log({ pos, neg, total, rate: pos/total });
  process.exit(0);
}).catch(console.error);
