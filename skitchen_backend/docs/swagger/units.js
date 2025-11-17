/**
 * @swagger
 * /api/units:
 *   get:
 *     summary: List all units
 *     tags:
 *       - Units
 *     responses:
 *       200:
 *         description: List of units
 *
 *   post:
 *     summary: Create a unit
 *     tags:
 *       - Units
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
 * /api/units/{id}:
 *   get:
 *     summary: Get unit by id
 *     tags: [Units]
 *   put:
 *     summary: Update unit
 *     tags: [Units]
 *   delete:
 *     summary: Delete unit
 *     tags: [Units]
 */