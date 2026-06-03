const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/scholarbee').then(async () => {
  const coll = mongoose.connection.collection('mlshadowcomparisons');
  const count = await coll.countDocuments();
  console.log('Shadow comparisons:', count);
  process.exit(0);
}).catch(console.error);
