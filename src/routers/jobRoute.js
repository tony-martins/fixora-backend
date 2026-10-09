import express from "express";
import {
  acceptJob,
  cancelJob,
  createJobs,
  //   deleteJob,
  getAvailableJobs,
  getJobById,
  getMyJobs,
  jobCompleted,
  jobInProgress,
  submitJobForReview,
  //   updateJob,
} from "../controllers/jobController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import pagination from "../middlewares/pagination.js";

const router = express.Router();

router.post("/", authMiddleware, createJobs);

router.get("/available-jobs", pagination, getAvailableJobs);

router.get("/available-jobs/:_id", getJobById);

router.get("/my-jobs/", authMiddleware, getMyJobs);

router.patch("/:id/accept", authMiddleware, acceptJob);

router.patch("/:id/in_progress", authMiddleware, jobInProgress);

router.patch("/:id/complete", authMiddleware, jobCompleted);

router.patch("/:id/submit-for-review", authMiddleware, submitJobForReview);

router.patch("/:id/cancel", authMiddleware, cancelJob);





// router.patch("/available-jobs/:_id", authMiddleware, updateJob);

// router.delete("/available-jobs/:_id", authMiddleware, deleteJob);

export default router;
