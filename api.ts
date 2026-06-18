import serverless from "serverless-http";
import { app } from "../../server";

// Wrap Express app as serverless handler for Netlify
export const handler = serverless(app);
