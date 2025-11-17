/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Manage products
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: List products
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     tags: [Products]
 *     summary: Create a product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, category_id]
 *             properties:
 *               name:
 *                 type: string
 *               picture:
 *                 type: string
 *               min_stock_threshold:
 *                 type: number
 *                 format: float
 *               category_id:
 *                 type: string
 *                 format: uuid
 *               purchasing_unit_id:
 *                 type: string
 *                 format: uuid
 *               selling_unit_id:
 *                 type: string
 *                 format: uuid
 *               isActive:
 *                 type: boolean
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, category_id]
 *             properties:
 *               name:
 *                 type: string
 *               picture:
 *                 type: string
 *                 format: binary
 *               min_stock_threshold:
 *                 type: number
 *                 format: float
 *               category_id:
 *                 type: string
 *                 format: uuid
 *               purchasing_unit_id:
 *                 type: string
 *                 format: uuid
 *               selling_unit_id:
 *                 type: string
 *                 format: uuid
 *               isActive:
 *                 type: boolean
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
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get a product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 *   put:
 *     tags: [Products]
 *     summary: Update a product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               name:
 *                 type: string
 *               picture:
 *                 type: string
 *               min_stock_threshold:
 *                 type: number
 *                 format: float
 *               category_id:
 *                 type: string
 *                 format: uuid
 *               purchasing_unit_id:
 *                 type: string
 *                 format: uuid
 *               selling_unit_id:
 *                 type: string
 *                 format: uuid
 *               isActive:
 *                 type: boolean
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               picture:
 *                 type: string
 *                 format: binary
 *               min_stock_threshold:
 *                 type: number
 *                 format: float
 *               category_id:
 *                 type: string
 *                 format: uuid
 *               purchasing_unit_id:
 *                 type: string
 *                 format: uuid
 *               selling_unit_id:
 *                 type: string
 *                 format: uuid
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: OK
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Deleted
 */
