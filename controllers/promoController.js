const Promo = require("../models/Promo");

exports.createPromo = async (req, res) => {
  try {
    const newPromo = new Promo(req.body);
    await newPromo.save();
    res.status(201).json(newPromo);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik" });
  }
};

exports.getPromos = async (req, res) => {
  try {
    const promos = await Promo.find();
    res.json(promos);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik" });
  }
};

exports.updatePromo = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPromo = await Promo.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedPromo) {
      return res.status(404).json({ message: "Promo not found" });
    }
    res.json(updatedPromo);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik" });
  }
};

exports.deletePromo = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPromo = await Promo.findByIdAndDelete(id);
    if (!deletedPromo) {
      return res.status(404).json({ message: "Promo not found" });
    }
    res.json(deletedPromo);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik" });
  }
};
