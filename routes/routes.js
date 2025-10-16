const express = require("express");
const {
  registerUser,
  loginUser,
  getUsers,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const {
  createWarehouse,
  getWarehouses,
  updateWarehouse,
  deleteWarehouse,
} = require("../controllers/warehouseController");
const {
  createProduct,
  getProducts,
  getProductsByWarehouse,
  updateProduct,
  deleteProduct,
  setDiscountForProducts,
  removeDiscountForProducts,
} = require("../controllers/productController");
const {
  createProductPartner,
  getProductsPartner,
  getProductsByWarehousePartner,
  updateProductPartner,
  deleteProductPartner,
  payPartnerDebt, // ✅ hamkorga qarz to‘lash controller
} = require("../controllers/partnerController");
const {
  sellProduct,
  getSalesHistory,
  getClientHistory,
  updateSale,
} = require("../controllers/saleController");
const {
  createClient,
  getClients,
  updateClient,
} = require("../controllers/clientController");
const {
  createDebt,
  getDebtsByClient,
  payDebt,
  getAllDebtors,
  getDailyReport,
  getDailyPaymentsByStoreId,
} = require("../controllers/debtController");
const auth = require("../middlewares/authMiddleware");
const {
  getRate,
  updateRate,
  createRate,
} = require("../controllers/UsdController");
const {
  getPromos,
  createPromo,
  updatePromo,
  deletePromo,
} = require("../controllers/promoController");
const { addBrak, getBrakHistory } = require("../controllers/brakController");
const {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");
const {
  createReport,
  getReports,
  updateReport,
  getReport,
  deleteReport,
  getAllReports,
} = require("../controllers/reportController");
const {
  createActPartner,
  getActPartner,
  getActPartnerById,
  getActPartnerByWarehouse,
  updateActPartnerById,
  deleteActPartnerById,
} = require("../controllers/ActPartnerController");
const {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");
const {
  createSalaryPayment,
  getAllSalaryPayments,
  getPaymentsByEmployee,
  deleteSalaryPayment,
} = require("../controllers/salaryPaymentController");
const {
  createStore,
  getStores,
  editStore,
  deleteStore,
} = require("../controllers/storeController");
const {
  getSentTransportions,
  getGotTransportions,
  createTransportion,
  acceptController,
  rejectTransportion,
  getAllTransportions,
} = require("../controllers/Transportion");
const UnfinishedController = require("../controllers/UnfinishedController");

const router = express.Router();

// ======================= USERS =======================
router.post("/users/register", registerUser);
router.post("/users/register-seller", auth, registerUser);
router.post("/users/login", loginUser);
router.get("/users", auth, getUsers);
router.put("/users/admin/:id", auth, updateUser);
router.delete("/users/admin/:id", auth, deleteUser);

// ======================= WAREHOUSES =======================
router.post("/warehouses/add", auth, createWarehouse);
router.get("/warehouses", auth, getWarehouses);
router.put("/warehouses/:id", auth, updateWarehouse);
router.delete("/warehouses/:id", auth, deleteWarehouse);

// ======================= STORES =======================
router.post("/stores/add", auth, createStore);
router.get("/stores", auth, getStores);
router.put("/stores/:id", auth, editStore);
router.delete("/stores/:id", auth, deleteStore);

// ======================= PRODUCTS =======================
router.post("/products/add", auth, createProduct);
router.get("/products", auth, getProducts);
router.get("/products/warehouse/:id", auth, getProductsByWarehouse);
router.put("/products/:id", auth, updateProduct);
router.delete("/products/:id", auth, deleteProduct);
router.put("/product/discount/set", auth, setDiscountForProducts);
router.put("/product/discount/remove", auth, removeDiscountForProducts);

// ======================= PARTNERS =======================
router.post("/partner/add", auth, createProductPartner);
router.get("/partner", auth, getProductsPartner);
router.get("/partner/warehouse/:id", auth, getProductsByWarehousePartner);
router.put("/partner/:id", auth, updateProductPartner);
router.delete("/partner/:id", auth, deleteProductPartner);

// ✅ Hamkorga qarzni to‘lash
router.post("/partners/pay", auth, payPartnerDebt);

// ======================= CLIENTS =======================
router.post("/clients", auth, createClient);
router.put("/clients/:id", auth, updateClient);
router.get("/clients", auth, getClients);

// ======================= SALES =======================
router.post("/sales/sell", auth, sellProduct);
router.get("/sales/history", auth, getSalesHistory);
router.get("/clients/:clientId/history", auth, getClientHistory);
router.put("/sales/:id", auth, updateSale);

// ======================= DEBTS =======================
router.post("/debts", auth, createDebt);
router.get("/debts/client/:clientId", auth, getDebtsByClient);
router.put("/debts/pay/:id", auth, payDebt);
router.get("/debts/debtors", auth, getAllDebtors);
router.get("/debts/daily/report", auth, getDailyReport);
router.get("/daily/debt", auth, getDailyPaymentsByStoreId);

// ======================= USD RATE =======================
router.post("/usd", auth, updateRate);
router.post("/usd/create", auth, createRate);
router.get("/usd", auth, getRate);

// ======================= PROMOS =======================
router.get("/promo", auth, getPromos);
router.post("/promo", auth, createPromo);
router.put("/promo/:id", auth, updatePromo);
router.delete("/promo/:id", auth, deletePromo);

// ======================= BRAK =======================
router.post("/brak/add", auth, addBrak);
router.get("/brak/history", auth, getBrakHistory);

// ======================= EXPENSES =======================
router.post("/expenses", auth, addExpense);
router.get("/expenses", auth, getExpenses);
router.put("/expenses/:id", auth, updateExpense);
router.delete("/expenses/:id", auth, deleteExpense);

// ======================= REPORTS =======================
router.post("/reports/add", auth, createReport);
router.get("/reports", auth, getReports);
router.get("/all/reports", auth, getAllReports);
router.get("/reports/:id", auth, getReport);
router.put("/reports/:id", auth, updateReport);
router.delete("/reports/:id", auth, deleteReport);

// ======================= ACT PARTNER =======================
router.post("/actpartner/add", auth, createActPartner);
router.get("/actpartner", auth, getActPartner);
router.get("/actpartner/:id", auth, getActPartnerById);
router.get("/actpartner/warehouse/:id", auth, getActPartnerByWarehouse);
router.put("/actpartner/:id", auth, updateActPartnerById);
router.post("/actpartner", auth, deleteActPartnerById);

// ======================= EMPLOYEES =======================
router.post("/employees", auth, createEmployee);
router.get("/employees", auth, getAllEmployees);
router.get("/employees/:id", auth, getEmployeeById);
router.put("/employees/:id", auth, updateEmployee);
router.delete("/employees/:id", auth, deleteEmployee);

// ======================= SALARY PAYMENTS =======================
router.post("/salary-payments", auth, createSalaryPayment);
router.get("/salary-payments", auth, getAllSalaryPayments);
router.get("/salary-payments/employee/:id", auth, getPaymentsByEmployee);
router.delete("/salary-payments/:id", auth, deleteSalaryPayment);

// ======================= TRANSPORTION =======================
router.post("/transportion/create", auth, createTransportion);
router.get("/transportion/sent", auth, getSentTransportions);
router.get("/transportion/got", auth, getGotTransportions);
router.put("/transportion/accept/:transportion_id", auth, acceptController);
router.put("/transportion/reject/:transportion_id", auth, rejectTransportion);
router.get("/transportion/all", auth, getAllTransportions);

// ======================= UNFINISHED =======================
router.post("/unfinished/add", auth, UnfinishedController.createUnfinished);
router.get("/unfinished", auth, UnfinishedController.getUnfinished);
router.put("/unfinished/:id", auth, UnfinishedController.updateUnfinished);
router.delete("/unfinished/:id", auth, UnfinishedController.deleteUnfinished);

module.exports = router;
