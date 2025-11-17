/**
 * @swagger
 * components:
 *   schemas:
 *     MenuCategory:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *
 * /api/menu-categories:
 *   get:
 *     summary: List all menu categories
 *     tags: [MenuCategories]
 *     responses:
 *       200:
 *         description: List of menu categories
 *
 *   post:
 *     summary: Create a menu category
 *     tags: [MenuCategories]
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
 *
 * /api/menu-categories/{id}:
 *   get:
 *     summary: Get menu category by id
 *     tags: [MenuCategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu category
 *   put:
 *     summary: Update menu category
 *     tags: [MenuCategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *   delete:
 *     summary: Delete menu category
 *     tags: [MenuCategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */