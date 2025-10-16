const SalaryPayment = require("../models/SalaryPaymentModel");
const Employee = require("../models/EmployeeModel");

exports.createSalaryPayment = async (req, res) => {
  try {
    const { employee, amount, description } = req.body;

    const emp = await Employee.findById(employee);
    if (!emp) {
      return res.status(404).json({ message: "Hodim topilmadi" });
    }

    const payment = await SalaryPayment.create({
      employee,
      amount,
      description,
    });

    res.status(201).json(payment);
  } catch (err) {
    console.error("To‘lov yaratishda xatolik:", err.message);
    res.status(500).json({ message: "Serverda xatolik" });
  }
};

// 🟢 Barcha to‘lovlar ro‘yxati
exports.getAllSalaryPayments = async (req, res) => {
  try {
    const payments = await SalaryPayment.find()
      .populate("employee", "name lastname position")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Serverda xatolik" });
  }
};

// 🟡 Bitta hodimning to‘lovlari
exports.getPaymentsByEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const payments = await SalaryPayment.find({ employee: employeeId }).sort({
      createdAt: -1,
    });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Serverda xatolik" });
  }
};

// 🔴 To‘lovni o‘chirish
exports.deleteSalaryPayment = async (req, res) => {
  try {
    const payment = await SalaryPayment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "To‘lov topilmadi" });
    }

    await payment.remove();
    res.json({ message: "To‘lov o‘chirildi" });
  } catch (err) {
    res.status(500).json({ message: "Serverda xatolik" });
  }
};
