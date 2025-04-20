const express = require('express');
const cors = require('cors')
const authRoute = require('./routes/auth.route')
const layoutRoutes = require('./routes/layout.route');
const freeposRoutes = require('./routes/freepos.routes');
const todoRoute = require('./routes/todo.route');
const weatherRoute = require('./routes/weather.route');
const noteRoute = require('./routes/note.route');
const columnRoute = require('./routes/column.routes');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const port = process.env.PORT || 8080;
const app = express();
app.set("trust proxy", 1);

const corsOptions ={
    credentials: true,
    optionSuccessStatus: 200,
    origin: true,
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth/', authRoute);
app.use('/api/layout', layoutRoutes);
app.use('/api/free-pos/', freeposRoutes);
app.use('/api/widgets/todo/', todoRoute);
app.use('/api/widgets/weather/', weatherRoute);
app.use('/api/widgets/note/', noteRoute);
app.use('/api/columns/', columnRoute);


const server = app.listen(port, () => {
    console.log("Server is listening to port " + port);
});


module.exports = server;