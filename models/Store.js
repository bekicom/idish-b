const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
    warehouseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Warehouse",
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    login: {
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    products: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            }
        ],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('Store', StoreSchema);