const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/dynamic-form", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB error:"));
db.once("open", () => console.log("MongoDB connected "));

const formDataSchema = new mongoose.Schema({}, { strict: false }); 
const FormData = mongoose.model("FormData", formDataSchema);

app.post("/submit", async (req, res) => {
  try {
    const data = new FormData(req.body);
    await data.save();
    res.status(200).json({ message: "Form data saved!" });
  } catch (err) {
    res.status(500).json({ message: "Error saving data", error: err });
  }
});

app.listen(4000, () => console.log("Server running on http://localhost:4000"));
