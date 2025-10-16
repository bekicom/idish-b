const Debt = require("../models/Debt");
const Rate = require("../models/usdModel");
const Sale = require("../models/Sale");
const Client = require("../models/Client");
const moment = require("moment");
const mongoose = require("mongoose");


exports.createDebt = async (req, res) => {
  try {
    const {
      clientId,
      partnerId,
      products,
      totalAmount,
      paymentHistory = [],
      storeId,
      dueDate,
    } = req.body;

    if (!storeId)
      return res.status(400).json({ message: "storeId majburiy maydon!" });
    if (!dueDate)
      return res.status(400).json({ message: "Qarz muddati (dueDate) kerak!" });

    const paid = paymentHistory.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );
    const remaining = Math.max(totalAmount - paid, 0);

    const debt = await Debt.create({
      clientId: clientId || null,
      partnerId: partnerId || null,
      products,
      totalAmount,
      remainingAmount: remaining,
      paymentHistory: paymentHistory.map((p) => ({
        ...p,
        storeId,
      })),
      dueDate,
      storeId,
      status: remaining <= 0 ? "paid" : "pending",
    });

    res.status(201).json({
      message: "Qarzdorlik muvaffaqiyatli yaratildi ✅",
      debt,
    });
  } catch (error) {
    console.error("createDebt error:", error);
    res.status(500).json({ message: "Server xatosi", error: error.message });
  }
};

/**
 * ✅ QARZ TO‘LASH (qisman yoki to‘liq)
 */
exports.payDebt = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, currency, type, storeId } = req.body;

    if (!storeId)
      return res.status(400).json({ message: "storeId majburiy maydon!" });

    // ✅ ID formatini tekshiramiz
    let debt;
    if (mongoose.isValidObjectId(id)) {
      debt = await Debt.findById(id);
    } else {
      // Agar bu telefon raqam bo‘lsa, client orqali topamiz
      const client = await Client.findOne({ phone: id });
      if (!client)
        return res
          .status(404)
          .json({ message: "Mijoz topilmadi yoki noto‘g‘ri telefon raqam" });

      debt = await Debt.findOne({ clientId: client._id, status: "pending" });
    }

    if (!debt) return res.status(404).json({ message: "Qarzdorlik topilmadi" });

    if (!amount || isNaN(amount))
      return res.status(400).json({ message: "To‘lov miqdori noto‘g‘ri" });

    const rateObj = await Rate.findOne();
    if (!rateObj)
      return res.status(400).json({ message: "Valyuta kursi topilmadi" });

    const { rate, kyg } = rateObj;

    // 🔹 To‘lovni tarixga qo‘shamiz
    debt.paymentHistory.push({
      amount,
      currency,
      storeId,
      type,
      date: new Date(),
    });

    // 🔹 Valyuta konvertatsiyasi
    let paidInUSD = 0;
    if (currency === "USD") paidInUSD = amount;
    else if (currency === "SUM") paidInUSD = amount / rate;
    else if (currency === "KGS") paidInUSD = amount / kyg;
    else
      return res
        .status(400)
        .json({ message: `Noto‘g‘ri valyuta turi (${currency})` });

    // 🔹 Qoldiqni kamaytirish
    debt.remainingAmount = Math.max(debt.remainingAmount - paidInUSD, 0);

    // 🔹 To‘liq to‘langanda
    if (debt.remainingAmount <= 0) {
      debt.status = "paid";
      debt.remainingAmount = 0;

      const client = debt.clientId
        ? await Client.findById(debt.clientId)
        : null;

      // 🔹 Har bir mahsulot uchun sotuv yozuvini yaratamiz
      for (const item of debt.products) {
        await Sale.create({
          clientId: debt.clientId,
          partnerId: debt.partnerId,
          productId: item.productId,
          quantity: item.quantity,
          unit: item.unit,
          storeId,
          warehouseId: item.warehouseId,
          sellingPrice: item.sellingPrice,
          totalAmount: item.totalAmount,
          promokodId: item.promokodId || null,
          currency: item.currency,
          clientAddress: client?.address || "Noma’lum",
          paymentMethod: "credit",
          discount: 0,
          payment: {
            usd: debt.paymentHistory
              .filter((p) => p.currency === "USD")
              .reduce((sum, p) => sum + p.amount, 0),
            sum: debt.paymentHistory
              .filter((p) => p.currency === "SUM")
              .reduce((sum, p) => sum + p.amount, 0),
            kgs: debt.paymentHistory
              .filter((p) => p.currency === "KGS")
              .reduce((sum, p) => sum + p.amount, 0),
          },
        });
      }
    }

    await debt.save();

    res.status(200).json({
      message: "To‘lov muvaffaqiyatli bajarildi ✅",
      remainingAmount: debt.remainingAmount,
      totalAmount: debt.totalAmount,
      status: debt.status,
      paymentHistory: debt.paymentHistory,
    });
  } catch (error) {
    console.error("payDebt error:", error);
    res.status(500).json({ message: "Server xatosi", error: error.message });
  }
};

exports.getDebtsByClient = async (req, res) => {
  const { clientId } = req.params;
  try {
    const debts = await Debt.find({ clientId })
      .populate("products.productId")
      .populate("paymentHistory.storeId");
    res.status(200).json(debts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllDebtors = async (req, res) => {
  try {
    // Barcha qarzlarni olamiz
    const allDebts = await Debt.find();

    // ❗ Filtrlab, faqat ObjectId bo‘lgan clientId va partnerId’larni qoldiramiz
    const validDebts = allDebts.filter(
      (d) =>
        (!d.clientId || mongoose.isValidObjectId(d.clientId)) &&
        (!d.partnerId || mongoose.isValidObjectId(d.partnerId))
    );

    // 🔹 populate’larni faqat to‘g‘ri id’larda ishlatamiz
    const debtors = await Debt.find({
      _id: { $in: validDebts.map((d) => d._id) },
      status: "pending",
    })
      .populate({
        path: "clientId",
        select: "name phone address",
      })
      .populate({
        path: "partnerId",
        select: "name_partner partner_number",
      })
      .populate({
        path: "products.productId",
        select: "name code size unit sellingPrice purchasePrice currency",
      })
      .populate({
        path: "paymentHistory.storeId",
        select: "name",
      })
      .sort({ createdAt: -1 });

    // 🔹 Qoldiqni hisoblaymiz va mahsulotni flatten qilamiz
    const result = debtors.flatMap((debt) => {
      const totalPaid = (debt.paymentHistory || []).reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0
      );
      const remainingAmount =
        debt.remainingAmount == null
          ? Math.max(debt.totalAmount - totalPaid, 0)
          : debt.remainingAmount;

      return (debt.products || []).map((prod) => ({
        _id: debt._id + "_" + (prod.productId?._id || Math.random()),
        clientId: debt.clientId,
        partnerId: debt.partnerId,
        productId: prod.productId || null,
        quantity: prod.quantity || 0,
        unit: prod.unit || "quantity",
        sellingPrice: prod.sellingPrice || 0,
        totalAmount: prod.totalAmount || 0,
        currency: prod.currency || "USD",
        remainingAmount,
        createdAt: debt.createdAt,
        dueDate: debt.dueDate,
      }));
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("getAllDebtors error:", error);
    res.status(500).json({ message: error.message });
  }
};


exports.getDailyPaymentsByStoreId = async (req, res) => {
  try {
    const { date, storeId } = req.query;

    if (!date || !storeId) {
      return res
        .status(400)
        .json({ message: "Sana va storeId majburiy maydonlar!" });
    }

    const targetDate = moment(date, "DD-MM-YYYY");
    const allDebts = await Debt.find({ "paymentHistory.storeId": storeId })
      .populate("products.productId")
      .populate("clientId");

    const matchedPayments = [];

    allDebts.forEach((debt) => {
      (debt.paymentHistory || []).forEach((payment) => {
        const paymentDate = moment(payment.date).utcOffset(5 * 60);
        if (
          paymentDate.format("DD-MM-YYYY") === targetDate.format("DD-MM-YYYY")
        ) {
          matchedPayments.push({
            debtorId: debt._id,
            client: debt.clientId,
            amount: payment.amount,
            currency: payment.currency,
            date: paymentDate.format("YYYY-MM-DD HH:mm"),
            product:
              debt.products && debt.products.length
                ? debt.products[0].productId?.name
                : null,
          });
        }
      });
    });

    return res.status(200).json(matchedPayments);
  } catch (error) {
    console.error("getDailyPaymentsByStoreId error:", error);
    return res.status(500).json({ message: "Ichki server xatosi" });
  }
};

exports.getDailyReport = async (req, res) => {
  try {
    const { date, storeId } = req.query;
    if (!date || !storeId)
      return res
        .status(400)
        .json({ message: "Sana va storeId majburiy maydonlar!" });

    const targetDate = moment(date, "YYYY-MM-DD");

    // 🔹 Sotuvlar
    const sales = await require("../models/Sale")
      .find({
        storeId,
        createdAt: {
          $gte: targetDate.startOf("day").toDate(),
          $lte: targetDate.endOf("day").toDate(),
        },
      })
      .populate("productId")
      .populate("clientId");

    // 🔹 Qarzdorliklar
    const debts = await require("../models/Debt")
      .find({
        storeId,
        createdAt: {
          $gte: targetDate.startOf("day").toDate(),
          $lte: targetDate.endOf("day").toDate(),
        },
      })
      .populate("products.productId")
      .populate("clientId");

    // 🔹 To‘lovlar
    const allDebts = await require("../models/Debt")
      .find({
        "paymentHistory.storeId": storeId,
      })
      .populate("clientId");

    const payments = [];
    allDebts.forEach((debt) => {
      (debt.paymentHistory || []).forEach((p) => {
        const pDate = moment(p.date);
        if (pDate.isSame(targetDate, "day")) {
          payments.push({
            clientId: debt.clientId,
            amount: p.amount,
            currency: p.currency,
            date: p.date,
          });
        }
      });
    });

    // 🔹 Hisoblash
    const sumByCurrency = (arr, field = "totalAmount") =>
      arr.reduce((acc, item) => {
        const cur = item.currency || "USD";
        const val = Number(item[field] || 0);
        acc[cur] = (acc[cur] || 0) + val;
        return acc;
      }, {});

    const totalSales = sumByCurrency(sales);
    const totalDebts = sumByCurrency(debts, "totalAmount");
    const totalPayments = sumByCurrency(payments, "amount");

    // 🔹 Faol valyuta: USD
    const summary = {
      totalSalesUSD: totalSales.USD || 0,
      totalDebtsUSD: totalDebts.USD || 0,
      totalPaymentsUSD: totalPayments.USD || 0,
    };

    const details = {
      salesUSD: sales,
      debtsUSD: debts,
      paymentsUSD: payments,
    };

    return res.status(200).json({ summary, details });
  } catch (error) {
    console.error("getDailyReport error:", error);
    return res.status(500).json({ message: "Server xatosi", error });
  }
};
