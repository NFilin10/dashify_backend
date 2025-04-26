const { Pool } = require('pg');
require('dotenv').config();

console.log(process.env.DB_USER);

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
});

const execute = async (...queries) => {
    try {
        const client = await pool.connect();
        try {
            for (const query of queries) {
                await client.query(query);
            }
            return true;
        } catch (error) {
            console.error('Error executing query:', error.stack);
            return false;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error acquiring client:', error.stack);
        return false;
    }
};

const waitForDatabase = async (retries = 5, delay = 5000) => {
    let success = false;
    while (retries > 0) {
        try {
            await pool.query('SELECT NOW()');
            success = true;
            console.log('Database is connected');
            break;
        } catch (err) {
            retries -= 1;
            console.log(`Waiting for DB to be ready. Retries left: ${retries}`);
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    return success;
};

const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        surname VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS widgets (
        id SERIAL PRIMARY KEY,
        widget_type VARCHAR(50) NOT NULL,
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS weather_widget (
        id SERIAL PRIMARY KEY,
        widget_id INTEGER NOT NULL UNIQUE,
        FOREIGN KEY (widget_id) REFERENCES widgets(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS city (
        id SERIAL PRIMARY KEY,
        weather_widget_id INTEGER NOT NULL,
        city TEXT,
        CONSTRAINT city_weather_widget_id_fkey FOREIGN KEY (weather_widget_id)
            REFERENCES weather_widget (widget_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS columns (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        width DOUBLE PRECISION NOT NULL,
        position INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS column_widgets (
        id SERIAL PRIMARY KEY,
        column_id INTEGER NOT NULL,
        widget_id INTEGER NOT NULL,
        position INTEGER NOT NULL,
        FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE,
        FOREIGN KEY (widget_id) REFERENCES widgets(id) ON DELETE CASCADE
    );


    CREATE TABLE IF NOT EXISTS freepos_widgets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        widget_id INTEGER NOT NULL,
        x DOUBLE PRECISION NOT NULL,
        y DOUBLE PRECISION NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (widget_id) REFERENCES widgets(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS layout_settings (
        id SERIAL PRIMARY KEY,
        theme VARCHAR(100) NOT NULL,
        color VARCHAR(100) NOT NULL,
        user_id INTEGER NOT NULL,
        image_path VARCHAR,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS note_widget (
        id SERIAL PRIMARY KEY,
        widget_id INTEGER NOT NULL UNIQUE,
        FOREIGN KEY (widget_id) REFERENCES widgets(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        note_widget_id INTEGER NOT NULL,
        note TEXT,
        FOREIGN KEY (note_widget_id) REFERENCES note_widget(widget_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS todo_widget (
        id SERIAL PRIMARY KEY,
        widget_id INTEGER NOT NULL UNIQUE,
        FOREIGN KEY (widget_id) REFERENCES widgets(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS todo_tasks (
        id SERIAL PRIMARY KEY,
        todo_list_id INTEGER NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        task TEXT,
        FOREIGN KEY (todo_list_id) REFERENCES todo_widget(widget_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS custom_link_widget (
        id SERIAL PRIMARY KEY,
        widget_id INTEGER NOT NULL UNIQUE,
        FOREIGN KEY (widget_id) REFERENCES widgets(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS links (
        id SERIAL PRIMARY KEY,
        custom_link_id INTEGER NOT NULL,
        link TEXT,
        FOREIGN KEY (custom_link_id) REFERENCES custom_link_widget(widget_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS image_carousel_widget (
        id SERIAL PRIMARY KEY,
        widget_id INTEGER NOT NULL UNIQUE,
        FOREIGN KEY (widget_id) REFERENCES widgets(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        image_carousel_id INTEGER NOT NULL,
        image_path VARCHAR,
        FOREIGN KEY (image_carousel_id) REFERENCES image_carousel_widget(widget_id) ON DELETE CASCADE
    );
`;



const initializeDatabase = async () => {
    const dbReady = await waitForDatabase();
    if (dbReady) {
        const result = await execute(createTablesQuery);
        if (result) {
            console.log('Tables created successfully');
        } else {
            console.log('Failed to create tables');
        }
    } else {
        console.error('Database connection failed after multiple retries.');
    }
};

initializeDatabase();

module.exports = pool;
