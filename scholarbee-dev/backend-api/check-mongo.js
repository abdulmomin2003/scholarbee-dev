const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/scholarbee').then(async () => {
  const count = await mongoose.connection.collection('impressions').countDocuments({ label: { $ne: null } });
  console.log('Labeled:', count);
  process.exit(0);
}).catch(console.error);
