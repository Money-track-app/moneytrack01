const mongoose = require('mongoose');


const scheduledSchema = new mongoose.Schema({
  /* … your schema … */
}, { timestamps: true });

const ScheduledTransaction = mongoose.model('ScheduledTransaction', scheduledSchema);


module.exports = ScheduledTransaction;

