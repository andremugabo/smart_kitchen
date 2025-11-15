/**
 * @swagger
 * tags:
 *   name: PurchaseHistory
 *   description: Record and view product purchase history
 */

/**
 * @swagger
 * /purchases:
 *   get:
 *     tags: [PurchaseHistory]
 *     summary: List purchases
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     tags: [PurchaseHistory]
 *     summary: Record a purchase with optional proof image
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [product_id, quantity, price_per_unit]
 *             properties:
 *               product_id:
 *                 type: integer
 *               quantity:
 *                 type: number
 *                 format: float
 *               price_per_unit:
 *                 type: number
 *                 format: float
 *               supplier_name:
 *                 type: string
 *               purchase_date:
 *                 type: string
 *                 format: date-time
 *               invoice_no:
 *                 type: string
 *               notes:
 *                 type: string
 *               proof:
 *                 type: string
 *                 format: binary
 *                 description: Purchase proof image file
 *     responses:
 *       201:
 *         description: Created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /purchases/{id}:
 *   get:
 *     tags: [PurchaseHistory]
 *     summary: Get a purchase record
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
