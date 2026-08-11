const Preference = require("../models/Preference");

exports.savePreference = async (req, res) => {

    try {

        const { tone, persona, language } = req.body;

        const id = await Preference.save(
            tone,
            persona,
            language
        );

        res.json({
            message: "Preferences saved successfully",
            id
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Failed to save preferences"
        });

    }

};

exports.getLatestPreference = async (req, res) => {

    try {

        const preference = await Preference.getLatest();

        if (!preference) {

            return res.json({
                tone: "Friendly",
                persona: "General User",
                language: "English"
            });

        }

        res.json(preference);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Database error"
        });

    }

};