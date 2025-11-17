import {
  getSalesSummary,
  getMenuPerformance,
  getPurchaseSummary,
} from "../services/reportService.js";

export const getSalesSummaryController = async (req, res) => {
  try {
    const { from, to } = req.query;
    const data = await getSalesSummary({ from, to });
    res.json({ success: true, data });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const getMenuPerformanceController = async (req, res) => {
  try {
    const { from, to } = req.query;
    const data = await getMenuPerformance({ from, to });
    res.json({ success: true, data });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const getPurchaseSummaryController = async (req, res) => {
  try {
    const { from, to } = req.query;
    const data = await getPurchaseSummary({ from, to });
    res.json({ success: true, data });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};
