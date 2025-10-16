const Transportion = require("../models/Transportion");
const Product = require("../models/Product");

exports.createTransportion = async (req, res) => {
  try {
    let io = req.app.get("socket");
    const { products, to_warehouse } = req.body;

    if (!products?.length || !to_warehouse) {
      return res
        .status(400)
        .json({ message: "Mahsulotlar va qabul qiluvchi ombor majburiy." });
    }

    for (const item of products) {
      const { product_id, quantity, unit } = item;

      const product = await Product.findById(product_id);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Mahsulot topilmadi: ${product_id}` });
      }
      if (unit === "box_quantity") {
        product.box_quantity -= quantity;

        if (product.isPackage) {
          product.package_quantity -=
            quantity * product.package_quantity_per_box;
          product.quantity -=
            quantity *
            product.package_quantity_per_box *
            product.quantity_per_package;
        } else {
          product.quantity -= quantity * product.quantity_per_package;
        }
        product.total_kg -= quantity * product.kg_per_box;
      } else if (unit === "package_quantity") {
        product.package_quantity -= quantity;
        product.quantity -= quantity * product.quantity_per_package;
        product.total_kg -= quantity * product.kg_per_package;
        product.box_quantity -= quantity / product.package_quantity_per_box;
      } else if (unit === "quantity") {
        product.quantity -= quantity;
        product.total_kg -= quantity * product.kg_per_quantity;

        if (product.isPackage) {
          product.package_quantity -= quantity / product.quantity_per_package;
          product.box_quantity -=
            quantity /
            (product.quantity_per_package * product.package_quantity_per_box);
        }
      }

      await product.save();
    }

    const newTransportion = new Transportion(req.body);
    const socketData = await Transportion.findById(newTransportion._id).populate(
      "products.product_id"
    );

    await newTransportion.save();
    io.emit("newTransportion", newTransportion);
    console.log('socket ishladi');

    res.status(201).json({
      message: "Jo'natma muvaffaqiyatli yaratildi",
      data: socketData,
    });
  } catch (err) {
    console.error("Xatolik:", err.message);
    return res.status(500).json({ message: "Serverda xatolik yuz berdi" });
  }
};

exports.getSentTransportions = async (req, res) => {
  try {
    const transportions = await Transportion.find({ status: "in_process" })
      .populate("to_warehouse")
      .populate("from_warehouse")
      .populate("products.product_id");
    res.status(200).json(transportions);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik" });
  }
};

exports.getGotTransportions = async (req, res) => {
  try {
    //   const transportions = await Transportion.find({ status: "in_process" });
    const transportions = await Transportion.find({
      status: { $ne: "in_process" },
    })
      .populate("to_warehouse")
      .populate("from_warehouse")
      .populate("products.product_id");
    res.status(200).json(transportions);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik" });
  }
};

exports.acceptController = async (req, res) => {
  try {
    const { transportion_id } = req.params;

    const transportion = await Transportion.findById(transportion_id).populate(
      "products.product_id"
    );
    if (!transportion) {
      return res.status(404).json({ message: "Jo'natma topilmadi" });
    }

    for (const item of transportion.products) {
      const { product_id, quantity, unit } = item;
      const barcode = product_id.barcode;
      const to_warehouse = transportion.to_warehouse;

      // Ombordagi mahsulotni qidirish
      let product = await Product.findOne({ warehouse: to_warehouse, barcode });

      if (product) {

        // Mavjud mahsulotga qo‘shish
        if (unit === "box_quantity") {
          product.box_quantity += quantity;

          if (product.isPackage) {
            product.package_quantity +=
              quantity * product.package_quantity_per_box;
            product.quantity +=
              quantity *
              product.package_quantity_per_box *
              product.quantity_per_package;
          } else {
            product.quantity += quantity * product.quantity_per_package;
          }
          product.total_kg += quantity * product.kg_per_box;
        } else if (unit === "package_quantity") {
          product.package_quantity += quantity;
          product.quantity += quantity * product.quantity_per_package;
          product.total_kg += quantity * product.kg_per_package;
          product.box_quantity += quantity / product.package_quantity_per_box;
        } else if (unit === "quantity") {
          product.quantity += quantity;
          product.total_kg += quantity * product.kg_per_quantity;

          if (product.isPackage) {
            product.package_quantity += quantity / product.quantity_per_package;
            product.box_quantity +=
              quantity /
              (product.quantity_per_package * product.package_quantity_per_box);
          }
        }

        await product.save();
      } else {
        // Yangi mahsulot yaratish
        const baseProduct = product_id;

        const newProduct = new Product({
          name: baseProduct.name,
          name_partner: baseProduct.name_partner,
          partner_number: baseProduct.partner_number,
          currency: baseProduct.currency,
          purchasePrice: baseProduct.purchasePrice,
          sellingPrice: baseProduct.sellingPrice,
          image_url: baseProduct.image_url,
          barcode: baseProduct.barcode,
          code: baseProduct.code,
          category: baseProduct.category,
          size: baseProduct.size,
          isPackage: baseProduct.isPackage,
          quantity_per_package: baseProduct.quantity_per_package,
          package_quantity_per_box: baseProduct.package_quantity_per_box,
          warehouse: to_warehouse,
          total_kg: 0,
        });

        // Mahsulot sonini `unit` bo‘yicha hisoblash
        if (unit === "box_quantity") {
          newProduct.box_quantity = quantity;
          if (baseProduct.isPackage) {
            newProduct.package_quantity =
              quantity * baseProduct.package_quantity_per_box;
            newProduct.quantity =
              newProduct.package_quantity * baseProduct.quantity_per_package;
          } else {
            newProduct.quantity = quantity * baseProduct.quantity_per_package;
          }
          newProduct.kg_per_box = baseProduct.kg_per_box;
          newProduct.total_kg = quantity * baseProduct.kg_per_box;
        } else if (unit === "package_quantity") {
          newProduct.package_quantity = quantity;
          newProduct.quantity = quantity * baseProduct.quantity_per_package;
          newProduct.kg_per_package = baseProduct.kg_per_package;
          newProduct.total_kg = quantity * baseProduct.kg_per_package;
        } else if (unit === "quantity") {
          newProduct.quantity = quantity;
          newProduct.kg_per_quantity = baseProduct.kg_per_quantity;
          newProduct.total_kg = quantity * baseProduct.kg_per_quantity;

          if (baseProduct.isPackage) {
            newProduct.package_quantity =
              quantity / baseProduct.quantity_per_package;
            newProduct.box_quantity =
              newProduct.package_quantity /
              baseProduct.package_quantity_per_box;
          }
        }

        await newProduct.save();
      }
    }

    // Jo'natma holatini o'zgartirish
    transportion.status = "delivered";
    await transportion.save();

    res.status(200).json({
      message: "Jo'natma muvaffaqiyatli qabul qilindi",
      data: transportion,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik" });
  }
};

exports.rejectTransportion = async (req, res) => {
  try {
    const { transportion_id } = req.params;

    const transportion = await Transportion.findById(transportion_id).populate(
      "products.product_id"
    );
    if (!transportion) {
      return res.status(404).json({ message: "Jo'natma topilmadi" });
    }

    for (const item of transportion.products) {
      const { product_id, quantity, unit } = item;
      const product = await Product.findById(product_id._id);

      if (!product) {
        return res
          .status(404)
          .json({ message: `Mahsulot topilmadi: ${product_id._id}` });
      }

      if (unit === "box_quantity") {
        product.box_quantity += quantity;

        if (product.isPackage) {
          product.package_quantity +=
            quantity * product.package_quantity_per_box;
          product.quantity +=
            quantity *
            product.package_quantity_per_box *
            product.quantity_per_package;
        } else {
          product.quantity += quantity * product.quantity_per_package;
        }

        product.total_kg += quantity * product.kg_per_box;
      } else if (unit === "package_quantity") {
        product.package_quantity += quantity;
        product.quantity += quantity * product.quantity_per_package;
        product.box_quantity += quantity / product.package_quantity_per_box;
        product.total_kg += quantity * product.kg_per_package;
      } else if (unit === "quantity") {
        product.quantity += quantity;
        product.total_kg += quantity * product.kg_per_quantity;

        if (product.isPackage) {
          product.package_quantity += quantity / product.quantity_per_package;
          product.box_quantity +=
            quantity /
            (product.quantity_per_package * product.package_quantity_per_box);
        }
      }

      await product.save();
    }

    // 🔁 Statusni "cancelled" qilish
    transportion.status = "cancelled";
    await transportion.save();

    res.status(200).json({
      message: "Jo'natma bekor qilindi va mahsulotlar qayta qo‘shildi",
      data: transportion,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik" });
  }
};

exports.getAllTransportions = async (req, res) => {
  try {
    const transportions = await Transportion.find()
      .populate("to_warehouse")
      .populate("from_warehouse")
      .populate("products.product_id")
      .populate("products.product_id");
    return res.json(transportions);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Serverda xatolik" });
  }
};
