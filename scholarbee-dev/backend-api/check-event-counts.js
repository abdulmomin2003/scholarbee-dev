const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/scholarbee').then(async () => {
  const Event = mongoose.model('UserEvent', new mongoose.Schema({}, {strict: false}), 'user_events');
  const AP = mongoose.model('AdmissionProgram', new mongoose.Schema({}, {strict: false}), 'admission_programs');
  const Program = mongoose.model('Program', new mongoose.Schema({}, {strict: false}), 'programs');
  const Template = mongoose.model('ProgramTemplate', new mongoose.Schema({}, {strict: false}), 'program_templates');

  const events = await Event.aggregate([
    { $match: { resource_type: 'admission_program' } },
    { $group: { _id: "$resource_id", count: { $sum: 1 }, type: { $first: "$event_type" } } },
    { $sort: { count: -1 } }
  ]);

  const results = [];
  
  for (const ev of events) {
    const ap = await AP.findById(ev._id);
    let title = 'Unknown Program';
    
    if (ap && ap.program) {
      const prog = await Program.findById(ap.program);
      if (prog && prog.template) {
         const temp = await Template.findById(prog.template);
         if (temp) {
             title = temp.name || temp.seo_title_key || 'Unknown Title';
         }
      }
    }
    
    results.push({
      resource_id: ev._id.toString(),
      program_title: title,
      event_type: ev.type,
      count: ev.count
    });
  }

  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
});
