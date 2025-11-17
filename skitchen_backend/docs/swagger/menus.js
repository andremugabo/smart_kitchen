/**
 * @swagger
 * components:
 *   schemas:
 *     Menu:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         picture:
 *           type: string
 *         price:
 *           type: number
 *           format: float
 *         estimated_cost:
 *           type: number
 *           format: float
 *         is_active:
 *           type: boolean
 *         is_kitchen_item:
 *           type: boolean
 *         category_id:
 *           type: string
 *           format: uuid
 *
 * /api/menus:
 *   get:
 *     summary: List all menus
 *     tags: [Menus]
 *     responses:
 *       200:
 *         description: List of menus
 *
 *   post:
 *     summary: Create a menu
 *     tags: [Menus]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, price, category_id]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               picture:
 *                 type: string
 *                 format: binary
 *               price:
 *                 type: number
 *                 format: float
 *               estimated_cost:
 *                 type: number
 *                 format: float
 *               is_active:
 *                 type: boolean
 *               is_kitchen_item:
 *                 type: boolean
 *               category_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Created
 *
 * /api/menus/{id}:
 *   get:
 *     summary: Get menu by id
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu
 *   put:
 *     summary: Update menu
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               picture:
 *                 type: string
 *                 format: binary
 *               price:
 *                 type: number
 *                 format: float
 *               estimated_cost:
 *                 type: number
 *                 format: float
 *               is_active:
 *                 type: boolean
 *               is_kitchen_item:
 *                 type: boolean
 *               category_id:
 *                 type: string
 *                 format: uuid
 *   delete:
 *     summary: Delete menu
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 * /api/menus/{id}/profit:
 *   get:
 *     summary: Get menu cost and profit information
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu cost, price, profit and margin
 */