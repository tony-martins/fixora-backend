import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import swaggerJSDoc from "swagger-jsdoc";

// Create __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build the route-file pattern
const routersGlob = path
  .resolve(__dirname, "../routers/*.js")
  .replace(/\\/g, "/");

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Fixora API",
      version: "1.0.0",
      description:
        "API documentation for Fixora, a marketplace where customers create jobs and service providers accept them.",
    },

    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
      {
        url: "https://fixora-backend-1t3n.onrender.com",
        description: "Production server",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  apis: [routersGlob],
};

// Check whether the route files contain Swagger annotations
// for (const file of ["jobRoute.js", "userRoute.js"]) {
//   const filePath = path.join(__dirname, "../routers", file);
//   const source = fs.readFileSync(filePath, "utf8");
// }

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
