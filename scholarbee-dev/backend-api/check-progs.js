const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/scholarbee').then(async () => {
  const db = mongoose.connection;
  const ids = [
    new mongoose.Types.ObjectId('69fe0b66741a2410ff9ceeac'),
    new mongoose.Types.ObjectId('67b9f131d94ce3f911e93646'),
    new mongoose.Types.ObjectId('6756c2dc7f49a166c615ba59')
  ];
  const ap = await db.collection('admission_programs').find({ _id: { $in: ids } }).toArray();
  console.log('Admission Programs found:', ap.length);
  
  const p = await db.collection('programs').find({ _id: { $in: ids } }).toArray();
  console.log('Programs found:', p.length);
  process.exit(0);
});
