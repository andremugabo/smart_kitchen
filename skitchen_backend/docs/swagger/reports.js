/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Reporting endpoints for sales, menus, and purchases
 */

/**
 * @swagger
 * /api/reports/sales-summary:
 *   get:
 *     summary: Get sales summary between optional dates
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *     responses:
 *       200:
 *         description: Sales summary
 */

/**
 * @swagger
 * /api/reports/menu-performance:
 *   get:
 *     summary: Get menu performance metrics
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Menu performance list
 */

/**
 * @swagger
 * /api/reports/purchase-summary:
 *   get:
 *     summary: Get purchase summary between optional dates
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Purchase summary
 */

/**
 * @swagger
 * /api/reports/sales-over-time:
 *   get:
 *     summary: Get sales aggregated per day between optional dates
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Array of points with date, totalRevenue and totalOrders
 */
