const UsdModel = require("../models/usdModel");

exports.createRate = async (req, res) => {
  try {
    const { rate, kgs } = req.body;
    const usd = await UsdModel.findOneAndUpdate(
      {},
      { rate, kgs },
      { upsert: true, new: true }
    );
    if (!usd) return res.status(404).json({ message: "Usd kurumu bulunamadı" });
    res.json(usd);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik" });
  }
};

exports.updateRate = async (req, res) => {
  try {
    const { rate, kgs } = req.body;

    const usd = await UsdModel.findOneAndUpdate(
      {},
      { rate, kgs },
      { new: true }
    );
    if (!usd) return res.status(404).json({ message: "Usd kurumu bulunamadı" });
    res.json(usd);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik" });
  }
};

exports.getRate = async (req, res) => {
  try {
    const usd = await UsdModel.findOne();
    if (!usd) return res.status(404).json({ message: "Xatolik" });

    res.json(usd);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik" });
  }
};
