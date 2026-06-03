const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/scholarbee').then(async () => {
  const AP = mongoose.model('AdmissionProgram', new mongoose.Schema({}, {strict: false}), 'admission_programs');
  const ap = await AP.find({_id: { $in: [
    new mongoose.Types.ObjectId('69983bca9d43d5bb8c79d3ad'), 
    new mongoose.Types.ObjectId('69f5ba08e28b164e04f8a3a2')
  ]}});
  
  console.log(JSON.stringify(ap.map(p => ({ 
    id: p._id, 
    is_active: p.is_active, 
    deadline: p.admission_deadline 
  })), null, 2));
  
  process.exit(0);
});
