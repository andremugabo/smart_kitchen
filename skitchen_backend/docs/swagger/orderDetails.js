/**
 * @swagger
 * components:
 *   schemas:
 *     OrderDetail:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         order_id:
 *           type: string
 *           format: uuid
 *         menu_id:
 *           type: string
 *           format: uuid
 *         quantity:
 *           type: integer
 *         price_at_time:
 *           type: number
 *           format: float
 *         kitchen_note:
 *           type: string
 *
 * /api/order-details/order/{orderId}:
 *   get:
 *     summary: List order details for an order
 *     tags: [OrderDetails]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of order details
 *
 * /api/order-details/{id}:
 *   get:
 *     summary: Get an order detail by id
 *     tags: [OrderDetails]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order detail
 *   put:
 *     summary: Update an order detail
 *     tags: [OrderDetails]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *   delete:
 *     summary: Delete an order detail
 *     tags: [OrderDetails]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
