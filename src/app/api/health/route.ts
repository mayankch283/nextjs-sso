import { HealthService } from '@/services/Health/HealthService';
import { NextResponse } from 'next/server';

/**
 * @swagger
 * tags:
 *   - name: Health
 *     description: Health check operations
 * /api/health:
 *   get:
 *     summary: Check Health
 *     description: Returns the health status of the service
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Service is healthy"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */
export function GET() {
  try {
    return NextResponse.json(HealthService.checkHealth());
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        message: (e as Error).message,
      },
      { status: 500 },
    );
  }
}
