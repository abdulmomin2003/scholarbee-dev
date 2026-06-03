const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/scholarbee').then(async () => {
  const AP = mongoose.model('AdmissionProgram', new mongoose.Schema({}, {strict: false}), 'admission_programs');
  const Admission = mongoose.model('Admission', new mongoose.Schema({}, {strict: false}), 'admissions');
  
  const programs = await AP.find({_id: { $in: [
    new mongoose.Types.ObjectId('69a01b5d4ab60f39c200e7fd')
  ]}});
  
  for(let p of programs) {
    const admissionId = p.admission;
    const admission = await Admission.findById(admissionId);
    console.log(`Program: ${p._id}`);
    if (admission) {
      console.log(`Admission ID: ${admission._id}`);
      console.log(`is_active: ${admission.is_active}`);
      console.log(`deadline: ${admission.admission_deadline}`);
      console.log(`Is Deadline Future? ${new Date(admission.admission_deadline).getTime() >= Date.now()}`);
      console.log(`is_active !== false? ${admission.is_active !== false}`);
    } else {
      console.log('Admission NOT FOUND');
    }
    console.log('-------------------------');
  }
  
  process.exit(0);
});
