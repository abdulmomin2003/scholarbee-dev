const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/scholarbee').then(async () => {
  const db = mongoose.connection;
  const aps = await db.collection('admission_programs').find({ 
    _id: { $in: [
      new mongoose.Types.ObjectId('69fe0b66741a2410ff9ceeac'), 
      new mongoose.Types.ObjectId('6756c2dc7f49a166c615ba59')
    ]} 
  }).toArray();
  for(let ap of aps) { 
    const ad = await db.collection('admissions').findOne({_id: ap.admission}); 
    console.log(ap._id, 'Admission deadline:', ad ? ad.admission_deadline : 'no admission', 'is_published:', ad ? ad.is_published : 'N/A'); 
  }
  process.exit(0);
});
