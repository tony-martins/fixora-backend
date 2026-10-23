import express from "express";
import {
  acceptJob,
  cancelJob,
  changeCustomerJobStatus,
  changeProviderJobStaus,
  createJobs,
  getAvailableJobs,
  getJobByCategory,
  getJobById,
  getMyJobs,
  jobCompleted,
  jobInProgress,
  submitJobForReview,
} from "../controllers/jobController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import pagination from "../middlewares/pagination.js";

const router = express.Router();

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job
 *     description: Allows an authenticated customer to create a job request.
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobInput'
 *     responses:
 *       201:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobResponse'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Authentication required
 */
router.post("/", authMiddleware, createJobs);

/**
 * @swagger
 * /api/jobs/available-jobs:
 *   get:
 *     summary: Get available jobs
 *     description: Returns unassigned jobs whose status is requested.
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Number of jobs per page
 *     responses:
 *       200:
 *         description: Available jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Available jobs retrieved successfully
 *                 jobs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Invalid pagination parameters
 */
router.get("/available-jobs", pagination, getAvailableJobs);

/**
 * @swagger
 * /api/jobs/category/{category}:
 *   get:
 *     summary: Get available jobs by category
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         example: plumbing
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *     responses:
 *       200:
 *         description: Jobs fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: jobs fetched successfully
 *                 jobs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     page:
 *                       type: integer
 *       400:
 *         description: Invalid job category
 */
router.get("/category/:category", pagination, getJobByCategory);

/**
 * @swagger
 * /api/jobs/available-jobs/{_id}:
 *   get:
 *     summary: Get a job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB job ID
 *         example: 671a1b2c3d4e5f6789012345
 *     responses:
 *       200:
 *         description: Job found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobResponse'
 *       404:
 *         description: Job not found
 *       400:
 *         description: Invalid MongoDB ID
 */
router.get("/available-jobs/:_id", getJobById);

/**
 * @swagger
 * /api/jobs/my-jobs:
 *   get:
 *     summary: Get the logged-in customer's jobs
 *     description: Returns jobs created by the authenticated user.
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: jobs retrieved successfully
 *                 jobs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 *       401:
 *         description: Authentication required
 */
router.get("/my-jobs/", authMiddleware, getMyJobs);

/**
 * @swagger
 * /api/jobs/{id}/accept:
 *   patch:
 *     summary: Accept a job
 *     description: Allows a service provider to accept a requested job.
 *     tags: [Job Status]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job accepted successfully
 *       400:
 *         description: Job is no longer requested
 *       403:
 *         description: Only providers can accept jobs
 *       404:
 *         description: Job not found
 */
router.patch("/:id/accept", authMiddleware, acceptJob);

/**
 * @swagger
 * /api/jobs/{id}/in_progress:
 *   patch:
 *     summary: Start a job
 *     description: The assigned provider changes an accepted job to in_progress.
 *     tags: [Job Status]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job is now in progress
 *       400:
 *         description: Job is not accepted
 *       403:
 *         description: Provider is not authorized or not assigned to this job
 *       404:
 *         description: Job not found
 */
router.patch("/:id/in_progress", authMiddleware, jobInProgress);

/**
 * @swagger
 * /api/jobs/{id}/submit-for-review:
 *   patch:
 *     summary: Submit a job for customer review
 *     description: The assigned provider submits an in-progress job for review.
 *     tags: [Job Status]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job submitted for customer review successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobResponse'
 *       400:
 *         description: Job is not in progress
 *       403:
 *         description: Provider is not authorized or not assigned to the job
 *       404:
 *         description: Job not found
 */
router.patch("/:id/submit-for-review", authMiddleware, submitJobForReview);

/**
 * @swagger
 * /api/jobs/{id}/complete:
 *   patch:
 *     summary: Complete a job
 *     description: The assigned provider marks an in-progress job as completed.
 *     tags: [Job Status]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobResponse'
 *       403:
 *         description: Only providers can complete jobs
 *       404:
 *         description: Job not found, not assigned to provider, or not in progress
 */
router.patch("/:id/complete", authMiddleware, jobCompleted);

/**
 * @swagger
 * /api/jobs/{id}/cancel:
 *   patch:
 *     summary: Cancel a requested job
 *     description: Only the customer who created a requested job can cancel it.
 *     tags: [Job Status]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobResponse'
 *       400:
 *         description: Only requested jobs can be cancelled
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only the owning customer can cancel the job
 *       404:
 *         description: Job not found
 */
router.patch("/:id/cancel", authMiddleware, cancelJob);

/**
 * @swagger
 * /api/jobs/{id}/provider-status:
 *   patch:
 *     summary: Change a job status as a provider
 *     description: >
 *       Allows an authenticated provider to accept an available job,
 *       start an accepted job, or submit an in-progress job for customer review.
 *       The provider must be assigned to the job for subsequent transitions.
 *     tags: [Job Status]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - accepted
 *                   - in_progress
 *                   - awaiting_review
 *                 example: accepted
 *     responses:
 *       200:
 *         description: Job status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobResponse'
 *       400:
 *         description: Invalid job ID or provider status
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only providers or the assigned provider can perform this action
 *       404:
 *         description: Job not found
 *       409:
 *         description: Job is unavailable or the status transition is invalid
 */
router.patch("/:id/provider-status", authMiddleware, changeProviderJobStaus);

/**
 * @swagger
 * /api/jobs/{id}/customer-status:
 *   patch:
 *     summary: Change a job status as a customer
 *     description: >
 *       Allows an authenticated customer to cancel their own requested job
 *       or confirm completion of their job after it has been submitted
 *       for review by the provider.
 *     tags: [Job Status]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - cancelled
 *                   - completed
 *                 example: completed
 *     responses:
 *       200:
 *         description: Job status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobResponse'
 *       400:
 *         description: Invalid job ID or customer status
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only the customer who owns the job can update it
 *       404:
 *         description: Job not found
 *       409:
 *         description: Job is not in the required status for this transition
 */
router.patch("/:id/customer-status", authMiddleware, changeCustomerJobStatus);

export default router;
