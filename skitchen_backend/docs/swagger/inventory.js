/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Manage inventory levels for products
 */

/**
 * @swagger
 * /inventory:
 *   get:
 *     tags: [Inventory]
 *     summary: List inventory entries
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @swagger
 * /inventory/{product_id}:
 *   get:
 *     tags: [Inventory]
 *     summary: Get inventory by product
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /inventory/{product_id}/set:
 *   put:
 *     tags: [Inventory]
 *     summary: Set inventory quantity for product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: number
 *                 format: float
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @swagger
 * /inventory/{product_id}/increment:
 *   patch:
 *     tags: [Inventory]
 *     summary: Increase inventory quantity for product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *                 format: float
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @swagger
 * /inventory/{product_id}/decrement:
 *   patch:
 *     tags: [Inventory]
 *     summary: Decrease inventory quantity for product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *                 format: float
 *     responses:
 *       200:
 *         description: OK
 */
