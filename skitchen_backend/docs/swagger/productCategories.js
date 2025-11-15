/**
 * @swagger
 * tags:
 *   name: ProductCategories
 *   description: Manage product categories
 */

/**
 * @swagger
 * /product-categories:
 *   get:
 *     tags: [ProductCategories]
 *     summary: List product categories
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     tags: [ProductCategories]
 *     summary: Create a product category
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
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
 * /product-categories/{id}:
 *   get:
 *     tags: [ProductCategories]
 *     summary: Get a product category
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
 *   put:
 *     tags: [ProductCategories]
 *     summary: Update a product category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 *   delete:
 *     tags: [ProductCategories]
 *     summary: Delete a product category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 */
