const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import model
const Attendance = require("./models/Attendance");

const app = express();

app.use(cors());
app.use(express.json());

// -------------------- TEST ROUTE --------------------
app.get("/", (req, res) => {
  res.send("TimeTrack Pro Server Running 🚀");
});

// -------------------- CLOCK-IN API --------------------
app.post("/api/clock-in", async (req, res) => {
  try {
    const newAttendance = new Attendance({
      userId: "user123",
      date: new Date(),
      clockIn: new Date(),
      breaks: []
    });

    await newAttendance.save();

    res.json({
      message: "Clock In successful ✅",
      data: newAttendance
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------- START BREAK API --------------------
app.post("/api/start-break", async (req, res) => {
  try {
    const attendance = await Attendance.findOne({ userId: "user123" }).sort({ date: -1 });

    if (!attendance) {
      return res.status(404).json({ message: "No attendance found" });
    }

    attendance.breaks.push({
      start: new Date()
    });

    await attendance.save();

    res.json({
      message: "Break started ⏸️",
      data: attendance
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------- END BREAK API --------------------
app.post("/api/end-break", async (req, res) => {
  try {
    const attendance = await Attendance.findOne({ userId: "user123" }).sort({ date: -1 });

    if (!attendance) {
      return res.status(404).json({ message: "No attendance found" });
    }

    const lastBreak = attendance.breaks[attendance.breaks.length - 1];

    if (!lastBreak || lastBreak.end) {
      return res.status(400).json({ message: "No active break to end" });
    }

    lastBreak.end = new Date();

    await attendance.save();

    res.json({
      message: "Break ended ▶️",
      data: attendance
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------- CLOCK-OUT API --------------------
app.post("/api/clock-out", async (req, res) => {
  try {
    const attendance = await Attendance.findOne({ userId: "user123" }).sort({ date: -1 });

    if (!attendance) {
      return res.status(404).json({ message: "No attendance found" });
    }

    attendance.clockOut = new Date();

    // Total time
    const totalTime = attendance.clockOut - attendance.clockIn;

    // Calculate break time
    let totalBreakTime = 0;

    attendance.breaks.forEach(b => {
      if (b.start && b.end) {
        totalBreakTime += (b.end - b.start);
      }
    });

    const workTime = totalTime - totalBreakTime;

    attendance.totalWorkTime = Math.floor(workTime / 1000 / 60); // in minutes
    attendance.totalBreakTime = Math.floor(totalBreakTime / 1000 / 60);

    await attendance.save();

    res.json({
      message: "Clock Out successful 🏁",
      totalWorkTime: attendance.totalWorkTime + " minutes",
      totalBreakTime: attendance.totalBreakTime + " minutes",
      data: attendance
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------- DATABASE CONNECTION --------------------
mongoose.connect("mongodb://localhost:27017/timetrack")
.then(() => {
  console.log("MongoDB Connected ✅");

  app.listen(5000, () => {
    console.log("Server running on port 5000 🚀");
  });
})
.catch(err => console.log(err));
