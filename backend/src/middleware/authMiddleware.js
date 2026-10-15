
import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  try {
    // Read the token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please log in.",
      });
    }

    // Extract the token after "Bearer "
    const token = authHeader.split(" ")[1];

    // Verify the token using our secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Make the authenticated user's information available
    // to the route being accessed
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
};

export default protect;
