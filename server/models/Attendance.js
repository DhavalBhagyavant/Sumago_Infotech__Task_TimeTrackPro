const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  userId: String,
  date: Date,

  clockIn: Date,
  clockOut: Date,

  breaks: [
    {
      start: Date,
      end: Date
    }
  ],

  totalWorkTime: Number,
  totalBreakTime: Number
});

module.exports = mongoose.model("Attendance", attendanceSchema);
