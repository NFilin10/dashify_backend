const pool = require("../database");
const axios = require("axios");

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

async function getCoordinates(cityName) {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(cityName)}&format=json&limit=1`
    );
    const data = await response.json();

    if (!data.length) {
        throw new Error("City not found");
    }

    return { lat: data[0].lat, lon: data[0].lon };
}

async function fetchWeather(lat, lon) {
    const response = await fetch(
        `https://api.weatherbit.io/v2.0/current?lat=${lat}&lon=${lon}&key=${WEATHER_API_KEY}`
    );

    console.log(`[Weather API] Request: https://api.weatherbit.io/v2.0/current?lat=${lat}&lon=${lon}&key=${WEATHER_API_KEY}`);

    const data = await response.json();

    if (!data.data?.length) {
        throw new Error("No weather data found.");
    }

    return data.data[0];
}

async function handleSaveCity(req, res) {
    try {
        const { widget_id, city } = req.body;

        if (!widget_id || !city) {
            return res.status(400).json({ message: "Missing widget_id or city" });
        }

        const { rows } = await pool.query(
            "SELECT id FROM city WHERE weather_widget_id = $1",
            [widget_id]
        );

        if (rows.length > 0) {
            await pool.query(
                "UPDATE city SET city = $1 WHERE weather_widget_id = $2",
                [city, widget_id]
            );
            console.log(`[DB] City updated for widget ${widget_id}: ${city}`);
        } else {
            await pool.query(
                "INSERT INTO city (weather_widget_id, city) VALUES ($1, $2)",
                [widget_id, city]
            );
            console.log(`[DB] City inserted for widget ${widget_id}: ${city}`);
        }

        res.status(200).json({ message: "City saved successfully." });
    } catch (error) {
        console.error("Error saving city:", error);
        res.status(500).json({ message: "Server error while saving city." });
    }
}

async function handleGetWeather(req, res) {
    try {
        const { widget_id } = req.query;

        if (!widget_id) {
            return res.status(400).json({ message: "Missing widget_id" });
        }

        const { rows } = await pool.query(
            "SELECT city FROM city WHERE weather_widget_id = $1",
            [widget_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "City not set for this widget." });
        }

        const city = rows[0].city;
        console.log(`[DB] Found city for widget ${widget_id}: ${city}`);

        const { lat, lon } = await getCoordinates(city);
        const weatherData = await fetchWeather(lat, lon);

        res.status(200).json(weatherData);
    } catch (error) {
        console.error("Error fetching weather:", error);
        res.status(500).json({ message: error.message || "Server error while fetching weather." });
    }
}

module.exports = {
    handleSaveCity,
    handleGetWeather
};
