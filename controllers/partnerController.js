const Partner = require("../models/Partner");

// Create a new product
exports.createProductPartner = async (req, res) => {
  try {
    const product = new Partner(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("Error in createProductPartner:", error);
    res.status(400).json({ error: error.message });
  }
};

// Update a product by ID
exports.updateProductPartner = async (req, res) => {
  try {
    const product = await Partner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error in updateProductPartner:", error);
    res.status(400).json({ error: error.message });
  }
};

// Get all products
exports.getProductsPartner = async (req, res) => {
  try {
    const products = await Partner.find().populate("warehouse");
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single product by ID
exports.getProductByIdPartner = async (req, res) => {
  try {
    const product = await Partner.findById(req.params.id).populate("warehouse");
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get products by warehouse
exports.getProductsByWarehousePartner = async (req, res) => {
  try {
    const products = await Partner.find({ warehouse: req.params.id }).populate(
      "warehouse"
    );
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a product by ID
exports.deleteProductPartner = async (req, res) => {
  try {
    const product = await Partner.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




// Qarz to‘lash (hamkor uchun)
exports.payPartnerDebt = async (req, res) => {
  try {
    const { partnerId, amount, method, note, currency } = req.body;

    // 1) Kiruvchi maydonlar tekshiruvi
    if (!partnerId || !amount || !method) {
      return res.status(400).json({ error: "Barcha maydonlarni to‘ldiring!" });
    }
    if (Number(amount) <= 0) {
      return res
        .status(400)
        .json({ error: "To‘lov summasi ijobiy bo‘lishi kerak" });
    }

    // 2) Partnerni olish
    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ error: "Partner topilmadi" });
    }

    // 3) Valyutani aniqlash (frontdan kelmasa, partner.currency)
    const payCurrency = currency || partner.currency || "USD";

    // 4) Maydonlarni default bilan tayyorlash
    partner.total_debt = Number(partner.total_debt || 0);
    partner.paid_amount = Number(partner.paid_amount || 0);
    partner.remaining_debt = Number(partner.remaining_debt || 0);

    // 5) To'lov tarixiga yozish
    if (!Array.isArray(partner.payment_history)) {
      partner.payment_history = [];
    }
    partner.payment_history.push({
      amount: Number(amount),
      currency: payCurrency,
      method, // "naqt" | "karta" | "bank"
      date: new Date(),
      note: note || "",
    });

    // 6) Aggregatlarni yangilash
    partner.paid_amount += Number(amount);
    // total_debt kamaytirilmaydi; remaining hisoblanadi
    partner.remaining_debt = Math.max(
      partner.total_debt - partner.paid_amount,
      0
    );

    // 7) Saqlash
    await partner.save();



    return res.status(200).json({
      message: "To‘lov muvaffaqiyatli amalga oshirildi",
      partner,
    });
  } catch (error) {
    console.error("Error in payPartnerDebt:", error);
    return res.status(500).json({ error: error.message });
  }
};