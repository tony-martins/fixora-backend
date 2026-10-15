import path from "path";
import swaggerJSDoc from "swagger-jsdoc";
import { fileURLToPath } from "url";

// Get current directory path for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  // 🔥 This dynamically targets the paths relative to this configuration file
  apis: [
    path.join(__dirname, "./src/routes/*.js"),
    path.join(__dirname, "./server.js"),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
