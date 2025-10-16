const Employee = require("../models/EmployeeModel");

// 🔵 Hodim yaratish
exports.createEmployee = async (req, res) => {
  try {
    const newEmployee = await Employee.create(req.body);
    res.status(201).json(newEmployee);
  } catch (err) {
    console.error("Hodim yaratishda xatolik:", err.message);
    res.status(500).json({ message: "Serverda xatolik" });
  }
};

// 🟢 Barcha hodimlarni olish
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: "Serverda xatolik" });
  }
};

// 🟡 Bitta hodimni olish
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Hodim topilmadi" });
    }
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: "Serverda xatolik" });
  }
};

// 🟠 Hodimni yangilash
exports.updateEmployee = async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) {
      return res.status(404).json({ message: "Hodim topilmadi" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Serverda xatolik" });
  }
};

// 🔴 Hodimni o‘chirish
exports.deleteEmployee = async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Hodim topilmadi" });
    }
    res.json({ message: "Hodim o‘chirildi" });
  } catch (err) {
    res.status(500).json({ message: "Serverda xatolik" });
  }
};
