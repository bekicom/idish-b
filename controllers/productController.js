const Product = require("../models/Product");
const Partner = require("../models/Partner");
const mongoose = require("mongoose");

exports.createProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      name,
      name_partner,
      partner_number,
      partner_address,
      currency,
      purchasePrice,
      warehouse,
      category,
      size,
      code,
      part,
      quantity = 0,
      box_quantity = 0,
      package_quantity = 0,
      total_kg = 0,
    } = req.body;

    // 🔎 Normalizatsiya (NaN oldini olish)
    const qty = Number(quantity) || 0;
    const boxQty = Number(box_quantity) || 0;
    const packQty = Number(package_quantity) || 0;
    const totalKg = Number(total_kg) || 0;
    const buyPrice = Number(purchasePrice?.value) || 0;
    const curr = currency || "USD";

    // 🔐 Mos product bor-yo'qligini tekshiramiz (bir xil identifikatorlarga ko'ra)
    const existingProduct = await Product.findOne(
      {
        name,
        name_partner,
        partner_number,
        partner_address,
        currency: curr,
        "purchasePrice.value": buyPrice,
        warehouse,
        category,
        size,
        code,
        part,
      },
      null,
      { session }
    );

    // 💵 Kirim qiymati bo'yicha hamkor qarziga qo'shiladigan summa
    const addedDebtAmount = buyPrice * qty; // kerak bo'lsa box yoki kg ga almashtirishingiz mumkin

    // ✅ 1) Mavjud product bo'lsa — miqdorlarni qo'shamiz
    if (existingProduct) {
      existingProduct.quantity = (existingProduct.quantity || 0) + qty;
      existingProduct.box_quantity =
        (existingProduct.box_quantity || 0) + boxQty;
      existingProduct.package_quantity =
        (existingProduct.package_quantity || 0) + packQty;
      existingProduct.total_kg = (existingProduct.total_kg || 0) + totalKg;
      await existingProduct.save({ session });

      // 🧩 Shu productga bog'langan partner yozuvini ham yangilaymiz
      const existingPartner = await Partner.findOne(
        { productId: existingProduct._id },
        null,
        { session }
      );

      if (existingPartner) {
        // miqdorlarni sinxron yangilash
        existingPartner.quantity = (existingPartner.quantity || 0) + qty;
        existingPartner.box_quantity =
          (existingPartner.box_quantity || 0) + boxQty;
        existingPartner.package_quantity =
          (existingPartner.package_quantity || 0) + packQty;
        existingPartner.total_kg = (existingPartner.total_kg || 0) + totalKg;

        // 💳 Hamkor qarzi: yangi kirim bo'lsa qo'shamiz
        if (addedDebtAmount > 0) {
          existingPartner.total_debt =
            (existingPartner.total_debt || 0) + addedDebtAmount;
          existingPartner.remaining_debt =
            (existingPartner.total_debt || 0) -
            (existingPartner.paid_amount || 0);

          existingPartner.payment_history.push({
            amount: -addedDebtAmount, // qarzni minus bilan log qilamiz
            currency: curr,
            method: "qarz",
            note: `${name} (${part || "partiya yo‘q"}) uchun tovar kirimi`,
          });
        }

        await existingPartner.save({ session });
      }

      await session.commitTransaction();
      session.endSession();
      return res
        .status(200)
        .json({ message: "Product updated", product: existingProduct });
    }

    // ✅ 2) Yangi product va partner yaratish
    const newProduct = new Product({
      ...req.body,
      currency: curr,
      purchasePrice: { value: buyPrice },
      quantity: qty,
      box_quantity: boxQty,
      package_quantity: packQty,
      total_kg: totalKg,
    });
    await newProduct.save({ session });

    const newPartner = new Partner({
      ...req.body,
      productId: newProduct._id,
      currency: curr,
      purchasePrice: { value: buyPrice },
      quantity: qty,
      box_quantity: boxQty,
      package_quantity: packQty,
      total_kg: totalKg,

      // 💳 Dastlabki qarzni o‘rnatamiz
      total_debt: addedDebtAmount > 0 ? addedDebtAmount : 0,
      paid_amount: 0,
      remaining_debt: addedDebtAmount > 0 ? addedDebtAmount : 0,
      payment_history:
        addedDebtAmount > 0
          ? [
              {
                amount: -addedDebtAmount,
                currency: curr,
                method: "qarz",
                note: `${name} (${part || "partiya yo‘q"}) uchun tovar kirimi`,
              },
            ]
          : [],
    });
    await newPartner.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res
      .status(201)
      .json({ message: "Product and Partner created", product: newProduct });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("createProduct error:", error);
    return res.status(400).json({ error: error.message });
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const { search } = req.query;

    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
          { size: { $regex: search, $options: "i" } },
          { code: { $regex: search, $options: "i" } },
        ],
      };
    }

    const products = await Product.find(query).populate("warehouse");
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("warehouse");
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get products by warehouse
exports.getProductsByWarehouse = async (req, res) => {
  try {
    const products = await Product.find({ warehouse: req.params.id }).populate(
      "warehouse"
    );
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    await Partner.findOneAndUpdate({ productId: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    await Partner.findOneAndDelete({ productId: req.params.id });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.setDiscountForProducts = async (req, res) => {
  try {
    const { name, category, code, size, discount } = req.body;

    if (!name || !category || !code || !size || discount == null) {
      return res
        .status(400)
        .json({ message: "Barcha maydonlar to'ldirilishi kerak" });
    }

    const products = await Product.find({ name, category, code, size });

    if (products.length === 0) {
      return res.status(404).json({ message: "Mahsulotlar topilmadi" });
    }

    const updatePromises = products.map(async (product) => {
      product.discount = discount;

      if (
        product.sellingPrice &&
        typeof product.sellingPrice.value === "number"
      ) {
        product.sellingPrice.value -=
          (product.sellingPrice.value / 100) * discount;
      }

      return product.save();
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      message: "Chegirma muvaffaqiyatli qo'llandi",
      updatedCount: products.length,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.setDiscountForProducts = async (req, res) => {
  try {
    const { name, category, code, size, discount } = req.body;

    if (!name || !category || !code || !size || discount == null) {
      return res
        .status(400)
        .json({ message: "Barcha maydonlar to'ldirilishi kerak" });
    }

    const products = await Product.find({ name, category, code, size });

    if (products.length === 0) {
      return res.status(404).json({ message: "Mahsulotlar topilmadi" });
    }

    const updatePromises = products.map(async (product) => {
      product.discount = discount;

      if (
        product.sellingPrice &&
        typeof product.sellingPrice.value === "number"
      ) {
        product.sellingPrice.value -=
          (product.sellingPrice.value / 100) * discount;
      }

      return product.save();
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      message: "Chegirma muvaffaqiyatli qo'llandi",
      updatedCount: products.length,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

exports.removeDiscountForProducts = async (req, res) => {
  try {
    const { name, category, code, size } = req.body;

    if (!name || !category || !code || !size) {
      return res
        .status(400)
        .json({ message: "Barcha maydonlar to'ldirilishi kerak" });
    }

    const products = await Product.find({ name, category, code, size });

    if (products.length === 0) {
      return res.status(404).json({ message: "Mahsulotlar topilmadi" });
    }

    const updatePromises = products.map(async (product) => {
      const discount = product.discount || 0;

      if (
        product.sellingPrice &&
        typeof product.sellingPrice.value === "number"
      ) {
        product.sellingPrice.value =
          product.sellingPrice.value / (1 - discount / 100);
      }

      product.discount = 0;

      return product.save();
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      message: "Chegirma olib tashlandi",
      updatedCount: products.length,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik", err });
  }
};

// 💰 Hamkorga to‘lov qilish
exports.payPartnerDebt = async (req, res) => {
  try {
    const { partnerId, amount, method, note } = req.body;

    // 🔎 Hamkorni topamiz
    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: "Hamkor topilmadi!" });
    }

    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) {
      return res.status(400).json({ message: "To‘lov summasi noto‘g‘ri!" });
    }

    // 💳 Qarzni yangilaymiz
    partner.paid_amount = (partner.paid_amount || 0) + payAmount;
    partner.remaining_debt = (partner.total_debt || 0) - (partner.paid_amount || 0);

    // 🧾 To‘lov tarixiga yozamiz
    partner.payment_history.push({
      amount: payAmount,
      currency: partner.currency || "USD",
      method: method || "naqt",
      note: note || "Qarzni to‘lash",
    });

    await partner.save();

    return res.status(200).json({
      message: "To‘lov muvaffaqiyatli amalga oshirildi",
      partner,
    });
  } catch (error) {
    console.error("payPartnerDebt error:", error);
    return res.status(500).json({ message: "Server xatosi", error: error.message });
  }
};
