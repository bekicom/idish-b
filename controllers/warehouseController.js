const Warehouse = require("../models/warehouseModel");
const bcrypt = require('bcryptjs')
exports.createWarehouse = async (req, res) => {
  const { name, address, password, login } = req.body;
  const hashed = await bcrypt.hash(password, 10)
  try {
    const warehouse = await Warehouse.create({ name, address, password: hashed, login });

    res.status(201).json(warehouse);
  } catch (error) {
    console.error("Error creating warehouse: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find({});
    res.json(warehouses);
  } catch (error) {
    console.error("Error getting warehouses: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateWarehouse = async (req, res) => {
  const { id } = req.params;
  const { name, address, login, password } = req.body;
  if (password) {
    const hashed = await bcrypt.hash(password, 10)
    req.body.password = hashed
  }


  try {
    const warehouse = await Warehouse.findById(id);

    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    await Warehouse.findByIdAndUpdate(id, req.body)
    res.json({});
  } catch (error) {
    console.error("Error updating warehouse: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteWarehouse = async (req, res) => {
  const { id } = req.params;

  try {
    const warehouse = await Warehouse.findById(id);

    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    await warehouse.remove();

    res.json({ message: "Warehouse removed" });
  } catch (error) {
    console.error("Error deleting warehouse: ", error);
    res.status(500).json({ message: "Server error" });
  }
};
