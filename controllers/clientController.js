const Client = require("../models/Client");

const createClient = async (req, res) => {
  const { name, phone, address } = req.body;
  if (!name || !phone || !address) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const newClient = new Client({ name, phone, address });
    await newClient.save();
    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClientHistory = async (req, res) => {
  const { clientId } = req.params;

  try {
    const client = await Client.findById(clientId).populate({
      path: "sales",
      populate: {
        path: "productId warehouseId",
      },
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateClient = async (req, res) => {
  const { id } = req.params;
  const { name, phone, address } = req.body;

  if (!name || !phone || !address) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { name, phone, address },
      { new: true }
    );
    res.status(200).json(updatedClient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteClient = async (req, res) => {
  const { id } = req.params;

  try {
    await Client.findByIdAndDelete(id);
    res.status(200).json({ message: "Client deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createClient,
  getClients,
  getClientHistory,
  updateClient,
  deleteClient,
};
