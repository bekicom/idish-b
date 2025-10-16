// reportController.js
const Report = require("../models/Report");

// @desc    Create new report
// @route   POST /api/reports/add
// @access  Private
exports.createReport = async (req, res) => {
  try {
    const {
      partnerId,
      partnerName,
      clientId,
      clientName,
      type,
      amount,
      currency,
      date,
      comment,
    } = req.body;

    // Validate required fields
    if ((!partnerId && !clientId) || !type || !amount || !currency) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide either partnerId or clientId, and type, amount, and currency",
      });
    }

    const report = new Report({
      ...(partnerId && { partnerId, partnerName: partnerName || "Unknown" }),
      ...(clientId && { clientId, clientName: clientName || "Unknown" }),
      type,
      amount,
      currency,
      date: date || Date.now(),
      comment,
      createdBy: req.user.id,
    });

    await report.save();

    res.status(201).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private
exports.getReports = async (req, res) => {
  try {
    const { id, type, startDate, endDate } = req.query; // Используем общий параметр "id"

    const filter = { createdBy: req.user.id };

    if (id) {
      filter.$or = [{ partnerId: id }, { clientId: id }]; // Фильтр по partnerId или clientId
    }
    if (type) filter.type = type;

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const reports = await Report.find(filter).sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find();
    return res.json(reports);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private
exports.getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (report.createdBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to view this report",
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update report
// @route   PUT /api/reports/:id
// @access  Private
exports.updateReport = async (req, res) => {
  try {
    const {
      partnerId,
      partnerName,
      clientId,
      clientName,
      type,
      amount,
      currency,
      date,
      comment,
    } = req.body;

    if (!type || !amount || !currency) {
      return res.status(400).json({
        success: false,
        message: "Please provide type, amount and currency",
      });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (report.createdBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this report",
      });
    }

    if (partnerId) {
      report.partnerId = partnerId;
      report.partnerName = partnerName || report.partnerName;
    }
    if (clientId) {
      report.clientId = clientId;
      report.clientName = clientName || report.clientName;
    }
    report.type = type;
    report.amount = amount;
    report.currency = currency;
    report.date = date || report.date;
    report.comment = comment || report.comment;

    await report.save();

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (report.createdBy.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this report",
      });
    }

    await report.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
