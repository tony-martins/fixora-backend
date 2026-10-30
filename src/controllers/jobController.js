import mongoose, { isValidObjectId } from "mongoose";
import Job from "../models/jobModel.js";

// 1. create jobs
export const createJobs = async (req, res, next) => {
  try {
    const { service, description, price, location, category } = req.body;

    if (!service || !description || !price || !location || !category) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields" });
    }

    const job = await Job.create({
      customer: req.user._id,
      service,
      description,
      price,
      location,
      category,
    });

    res.status(201).json({ message: "Job created successfully", job: job });
  } catch (error) {
    next(error);
  }
};

// get job by category
export const getJobByCategory = async (req, res, next) => {
  try {
    const category = req.params.category.toLowerCase();

    const validCategories = Job.schema.path("category").enumValues;

    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "invalid job category" });
    }

    const { page, skip, limit } = req.pagination;

    const jobs = await Job.find({
      status: "requested",
      category,
      provider: null,
    })
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: "jobs fetched successfully",
      jobs,
      pagination: { limit, page },
    });
  } catch (error) {
    next(error);
  }
};

// get available jobs
export const getAvailableJobs = async (req, res, next) => {
  try {
    // pagination
    const { page, limit, skip } = req.pagination;

    const totalJobs = await Job.countDocuments();

    const jobs = await Job.find({ status: "requested", provider: null })
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: "Available jobs retrieved successfully",
      jobs: jobs,
      pagination: { limit, totalJobs, page },
    });
  } catch (error) {
    next(error);
  }
};

// get available jobs by id
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params._id);

    if (!job) {
      return res.status(404).json({ message: "job not found" });
    }

    res.status(200).json({ message: "job found successfully", job: job });
  } catch (error) {
    next(error);
  }
};

// get my jobs
export const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ customer: req.user._id });

    res
      .status(200)
      .json({ message: "jobs retrieved successfully", jobs: jobs });
  } catch (error) {
    next(error);
  }
};

// get provider jobs
export const getProviderJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ provider: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      message: "Provider jobs retrieved successfully",
      jobs,
    });
  } catch (error) {
    next(error);
  }
};


// cancel requested job
export const cancelJob = async (req, res, next) => {
  try {
    // 1. Only customers can cancel jobs
    if (req.user.role !== "customer") {
      return res
        .status(403)
        .json({ message: "Only customers can cancel jobs" });
    }

    // 2. Get the job ID from the URL
    const { id } = req.params;

    // 3. Find the job by its ID
    const job = await Job.findById(id);

    // 4. Check if the job exists
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // 5. Check if the logged-in customer owns the job
    if (job.customer.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to cancel this job" });
    }

    // 6. Only allow cancellation when requested
    if (job.status !== "requested") {
      return res
        .status(400)
        .json({ message: "Only requested jobs can be cancelled" });
    }

    // 7. Change the job status
    job.status = "cancelled";

    // 8. Save the changes
    await job.save();

    return res.status(200).json({ message: "Job cancelled successfully", job });
  } catch (error) {
    next(error);
  }
};

// change status to accepted
export const acceptJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);

    // check if job exists
    if (!job) {
      return res.status(404).json({ message: "job not found" });
    }

    // check if job is still requested
    if (job.status !== "requested") {
      return res.status(400).json({
        message: `Job cannot be accepted because it is already ${job.status}`,
      });
    }

    // make sure the logged-in user is the provider
    if (req.user.role !== "provider") {
      return res
        .status(403)
        .json({ message: "You are not authorized to accept this job" });
    }

    // change status
    job.status = "accepted";

    // assign the provider to the job
    job.provider = req.user._id;

    await job.save();

    res.status(200).json({ message: "Job accepted successfully" });
  } catch (error) {
    next(error);
  }
};

// change status to in_progress
export const jobInProgress = async (req, res, next) => {
  try {
    // make sure the logged-in user is the provider
    if (req.user.role !== "provider") {
      return res
        .status(403)
        .json({ message: "You are not authorized to accept this job" });
    }

    const { id } = req.params;

    const job = await Job.findById(id);

    // check if job exists
    if (!job) {
      return res.status(404).json({ message: "job not found" });
    }

    // check if job is allready accepted
    if (job.status !== "accepted") {
      return res.status(400).json({
        message: `Job cannot be in_progress because it is ${job.status}`,
      });
    }

    if (job.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "unAuthorized" });
    }

    // if (condition) {
    // }

    // change status
    job.status = "in_progress";

    // assign the provider to the job
    job.provider = req.user._id;

    await job.save();

    res.status(200).json({ message: "Job in progress", job });
  } catch (error) {
    next(error);
  }
};

// review job
export const submitJobForReview = async (req, res, next) => {
  try {
    // 1. Only customers can review their jobs
    if (req.user.role !== "provider") {
      return res
        .status(403)
        .json({ message: "Only providers can set jobs for review" });
    }

    // 2. Get the job ID from the URL
    const { id } = req.params;

    // 3. Find the job by its ID
    const job = await Job.findById(id);

    // 4. Check if the job exists
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // 5. Make sure the job belongs to this customer
    if (job.provider.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to review this job" });
    }

    // 6. Make sure the job is in progress
    if (job.status !== "in_progress") {
      return res.status(400).json({
        message: "Only jobs in progress can be submitted for review",
      });
    }

    // 7. Submit the job for customer review
    job.status = "awaiting_review";

    await job.save();

    return res.status(200).json({
      message: "Job submitted for customer review successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
};

// change status to completed
export const jobCompleted = async (req, res, next) => {
  try {
    // 1. Make sure the logged-in user is a provider
    if (req.user.role !== "provider") {
      return res
        .status(403)
        .json({ message: "Only providers can complete a job" });
    }

    // 2. Get the job ID from the URL
    const { id } = req.params;

    // 3. Find the job and update its status
    const job = await Job.findOneAndUpdate(
      { _id: id, provider: req.user._id, status: "in_progress" },
      { status: "completed" },
      { new: true, runValidators: true },
    );

    // 4. Check if the job was found and updated
    if (!job) {
      return res.status(404).json({
        message: "Job not found, not assigned to you, or not in progress",
      });
    }

    // 5. Send the success response
    return res.status(200).json({ message: "Job completed successfully", job });
  } catch (error) {
    next(error);
  }
};

export const changeProviderJobStaus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    if (req.user.role !== "provider") {
      return res
        .status(403)
        .json({ message: "Only providers can perform this action" });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "invalid id" });
    }

    const transition = {
      accepted: "requested",
      in_progress: "accepted",
      awaiting_review: "in_progress",
    };

    if (!Object.hasOwn(transition, status)) {
      return res.status(400).json({ message: "invalid provider status" });
    }

    const filter = {
      _id: id,
      status: transition[status],
      ...(status === "accepted" ? { provider: null } : { provider: userId }),
    };

    const update = {
      $set: { status, ...(status === "accepted" ? { provider: userId } : {}) },
    };

    const job = await Job.findOneAndUpdate(filter, update, {
      new: true,
      runValidators: true,
    })
      .populate("customer", "name")
      .populate("provider", "name");

    console.log(job);

    if (!job) {
      const existingJob = await Job.findById(id);

      if (!existingJob) {
        return res.status(404).json({ message: "job not found" });
      }

      return res.status(409).json({
        message:
          "job is unavailable, has been assigned to another provider, has an invalid transition status",
      });
    }

    return res
      .status(200)
      .json({ message: "status updated successfully", job });
  } catch (error) {
    next(error);
  }
};

// Change job status as a customer
export const changeCustomerJobStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    // 1. Only customers can perform this action
    if (req.user.role !== "customer") {
      return res.status(403).json({
        message: "Only customers can perform this action",
      });
    }

    // 2. Validate the job ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid job ID",
      });
    }

    // 3. Define the allowed customer status transitions
    const transitions = {
      cancelled: "requested",
      completed: "awaiting_review",
    };

    // 4. Validate the requested status
    if (!Object.hasOwn(transitions, status)) {
      return res.status(400).json({
        message: "Invalid customer status",
      });
    }

    // 5. Update only a job owned by this customer
    //    and currently in the required status
    const job = await Job.findOneAndUpdate(
      {
        _id: id,
        customer: userId,
        status: transitions[status],
      },
      {
        $set: { status },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("customer", "name")
      .populate("provider", "name");

    // 6. If no job was updated, determine why
    if (!job) {
      const existingJob = await Job.findById(id);

      if (!existingJob) {
        return res.status(404).json({ message: "Job not found" });
      }

      if (existingJob.customer.toString() !== userId.toString()) {
        return res
          .status(403)
          .json({ message: "You are not authorized to update this job" });
      }

      return res.status(409).json({
        message: `Job cannot be changed to ${status} because its current status is ${existingJob.status}`,
      });
    }

    // 7. Send the updated job
    return res
      .status(200)
      .json({ message: "Job status updated successfully", job });
  } catch (error) {
    next(error);
  }
};

// export const changeJobStaus = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     const userId = String(req.user._id);
//     const { role } = req.user;

//     if (!isValidObjectId(id)) {
//       return res.status(400).json({ message: "invalid id" });
//     }

//     const allowStatuses = ["accepted", "in_progress", "completed", "cancelled"];
//     if (!allowStatuses.includes(status)) {
//       return res.status(400).json({ message: "invalid status" });
//     }

//     const job = await Job.findById(id);

//     if (!job) {
//       return res.status(404).json({ message: "job not found" });
//     }

//     let filter;

//     let update;

//     // label Customer allowed status change
//     if (role === "customer") {
//       if (String(job.customer !== userId)) {
//         return res
//           .status(403)
//           .json({ message: "You're not authorized to modify this job" });
//       }
//     }

//     if (status !== "cancelled") {
//       return res.status(403).json({ message: "Only customers can cancel job" });
//     }

//     if (job.status !== "requested") {
//       return res
//         .status(400)
//         .json({ message: "Only requested job can be canceled" });
//     }

//   } catch (error) {
//     next(error);
//   }
// };

// update job
// export const updateJob = async (req, res, next) => {
//   try {
//     const job = await Job.findByIdAndUpdate(req.params._id, req.body, {
//       new: true,
//       runValidators: true,
//     });

//     res.status(200).json({ message: "job updated successfully", job: job });

//     if (!job) {
//       return res.status(400).json({ message: "job not found" });
//     }
//   } catch (error) {
//     next(error);
//   }
// };

// // delete job
// export const deleteJob = async (req, res, next) => {
//   try {
//     const job = await Job.findByIdAndDelete(req.params._id);

//     res.status(200).json({ message: "job deleted successfully"});

//     if (!job) {
//       return res.status(404).json({ message: "job not found" });
//     }
//   } catch (error) {
//     next(error);
//   }
// };
