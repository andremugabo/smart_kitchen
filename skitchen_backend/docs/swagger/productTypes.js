/**
 * @swagger
 * tags:
 *   name: ProductTypes
 *   description: Manage product types
 */

/**
 * @swagger
 * /product-types:
 *   get:
 *     tags: [ProductTypes]
 *     summary: List product types
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     tags: [ProductTypes]
 *     summary: Create a product type
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
 *               description:
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
 * /product-types/{id}:
 *   get:
 *     tags: [ProductTypes]
 *     summary: Get a product type
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
 *     tags: [ProductTypes]
 *     summary: Update a product type
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
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 *   delete:
 *     tags: [ProductTypes]
 *     summary: Delete a product type
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
