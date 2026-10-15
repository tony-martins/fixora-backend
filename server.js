import app from "./src/app.js";
import connectDB from "./src/configs/mongodb.js";
import userRoute from "./src/routers/userRoute.js";
import jobRoute from "./src/routers/jobRoute.js"
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./src/configs/swagger.js";

connectDB();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.json({ message: "Api is reachable" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", userRoute);

app.use("/api/jobs", jobRoute)

app.listen(PORT, () => {
  console.log(`App is Running at port ${PORT}`);
});
