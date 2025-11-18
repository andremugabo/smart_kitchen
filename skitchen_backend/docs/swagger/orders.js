/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         order_date:
 *           type: string
 *           format: date-time
 *         total_amount:
 *           type: number
 *           format: float
 *         status:
 *           type: string
 *           enum: [pending, preparing, ready, served, completed, canceled]
 *         table_number:
 *           type: string
 *
 * /api/orders:
 *   get:
 *     summary: List all orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of orders
 *
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, items]
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *               table_number:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [menu_id, quantity]
 *                   properties:
 *                     menu_id:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                     kitchen_note:
 *                       type: string
 *     responses:
 *       201:
 *         description: Created
 *
 * /api/orders/{id}:
 *   get:
 *     summary: Get an order by id (with its details)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order with details
 *
 *   delete:
 *     summary: Delete an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, preparing, ready, served, completed, canceled]
 *     responses:
 *       200:
 *         description: Updated order
 */

/**
 * @swagger
 * /api/orders/kitchen:
 *   get:
 *     summary: List active orders for the kitchen (pending and in_progress)
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of active orders with their items
 */

/**
 * @swagger
 * /api/orders/waiter/current:
 *   get:
 *     summary: Get the current waiter's open orders and stats
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Stats and list of open orders for the logged-in waiter
 */
