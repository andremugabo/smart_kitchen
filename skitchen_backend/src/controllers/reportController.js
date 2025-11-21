import {
  getSalesSummary,
  getMenuPerformance,
  getPurchaseSummary,
  getSalesOverTime,
  getWaiterPerformance,
  getChefPerformance,
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

export const getSalesOverTimeController = async (req, res) => {
  try {
    const { from, to } = req.query;
    const data = await getSalesOverTime({ from, to });
    res.json({ success: true, data });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const getWaiterPerformanceController = async (req, res) => {
  try {
    const { from, to } = req.query;
    const data = await getWaiterPerformance({ from, to });
    res.json({ success: true, data });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

export const getChefPerformanceController = async (req, res) => {
  try {
    const { from, to } = req.query;
    const data = await getChefPerformance({ from, to });
    res.json({ success: true, data });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};
