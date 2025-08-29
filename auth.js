const jwt = require("jsonwebtoken");
require("dotenv").config();

// ----------------- Token Creation -----------------
module.exports.createAccessToken = (user) => {
    const data = {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin
    };

    return jwt.sign(data, process.env.JWT_SECRET_KEY, {
        expiresIn: "1h" // optional: auto-expire after 1 hour
    });
};

// ----------------- Token Verification -----------------
module.exports.verify = (req, res, next) => {
    let token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ auth: false, message: "No token provided" });
    }

    // Handle both "Bearer <token>" and raw "<token>"
    if (token.startsWith("Bearer ")) {
        token = token.slice(7);
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decodedToken) => {
        if (err) {
            return res.status(403).json({
                auth: false,
                message: "Token is invalid or expired",
                error: err.message
            });
        }

        req.user = decodedToken; // ✅ attach user to request
        next();
    });
};

// ----------------- Verify Admin -----------------
module.exports.verifyAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        return res.status(403).json({
            auth: false,
            message: "Action Forbidden"
        });
    }
};

// ----------------- Error Handler -----------------
module.exports.errorHandler = (err, req, res, next) => {
    console.error(err);
    const statusCode = err.status || 500;
    const errorMessage = err.message || "Internal Server Error";

    res.status(statusCode).json({
        error: {
            message: errorMessage,
            errorCode: err.code || "SERVER_ERROR",
            details: err.details || null
        }
    });
};

// ----------------- Check if Logged In -----------------
module.exports.isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
};
