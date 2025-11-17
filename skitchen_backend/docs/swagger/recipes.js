/**
 * @swagger
 * components:
 *   schemas:
 *     Recipe:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         menu_id:
 *           type: string
 *           format: uuid
 *         product_id:
 *           type: string
 *           format: uuid
 *         quantity_required:
 *           type: number
 *           format: float
 *         unit_id:
 *           type: string
 *           format: uuid
 *
 * /api/recipes:
 *   get:
 *     summary: List all recipes
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: List of recipes
 *
 *   post:
 *     summary: Create a recipe
 *     tags: [Recipes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [menu_id, product_id, quantity_required, unit_id]
 *             properties:
 *               menu_id:
 *                 type: string
 *                 format: uuid
 *               product_id:
 *                 type: string
 *                 format: uuid
 *               quantity_required:
 *                 type: number
 *                 format: float
 *               unit_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Created
 *
 * /api/recipes/{id}:
 *   get:
 *     summary: Get recipe by id
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recipe
 *   put:
 *     summary: Update recipe
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *   delete:
 *     summary: Delete recipe
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 * /api/recipes/menu/{menuId}:
 *   get:
 *     summary: List recipes for a menu
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of recipes for the menu
 */