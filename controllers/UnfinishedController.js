const Unfinished = require("../models/UnfinishedModel");

class UnfinishedController {
  async getUnfinished(req, res) {
    try {
      const unfinished = await Unfinished.find();
      if (!unfinished.length) {
        return res.status(404).json({ message: "malumot topilmadi" });
      }
      res.status(200).json(unfinished);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  async createUnfinished(req, res) {
    try {
      const unfinished = await Unfinished.create(req.body);
      if (!unfinished) {
        return res.status(400).json({ message: "malumot saqlanmadi" });
      }
      res.status(201).json(unfinished);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  async updateUnfinished(req, res) {
    try {
      const unfinished = await Unfinished.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!unfinished) {
        return res.status(404).json({ message: "malumot topilmadi" });
      }
      res.status(200).json(unfinished);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  async deleteUnfinished(req, res) {
    try {
      const unfinished = await Unfinished.findByIdAndDelete(req.params.id);
      if (!unfinished) {
        return res.status(404).json({ message: "malumot topilmadi" });
      }
      res.status(200).json(unfinished);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new UnfinishedController();
