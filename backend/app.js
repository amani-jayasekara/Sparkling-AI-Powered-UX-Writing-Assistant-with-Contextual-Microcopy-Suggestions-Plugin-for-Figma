require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// ============================================================
// Database
// ============================================================

const db = require("./database/db");


// ============================================================
// Routes
// ============================================================

const preferencesRoute =
    require("./routes/preferences");

const generateRoute =
    require("./routes/generate");

const feedbackRoute =
    require("./routes/feedbackRoutes");

const historyRoute =
    require("./routes/historyRoutes");

const sessionRoute =
    require("./routes/sessionRoutes");


// ============================================================
// Express App
// ============================================================

const app = express();


// ============================================================
// Middleware
// ============================================================

app.use(cors());

app.use(
    bodyParser.json()
);


// ============================================================
// Root Route
// ============================================================

app.get("/", (req, res) => {

    res.send(
        "Sparkling UX Backend is Running!"
    );

});


// ============================================================
// API Routes
// ============================================================

app.use(
    "/preferences",
    preferencesRoute
);

app.use(
    "/generate",
    generateRoute
);

app.use(
    "/",
    historyRoute
);

app.use(
    "/",
    feedbackRoute
);

app.use(
    "/",
    sessionRoute
);


// ============================================================
// Configuration
// ============================================================

const config =
    require("./config/env");

const PORT =
    config.PORT || 3000;


// ============================================================
// Start Server
// ============================================================

app.listen(
    PORT,
    () => {

        console.log(
            `Server running on http://localhost:${PORT}`
        );

        console.log(
            "Sparkling UX Backend is ready."
        );

    }
);