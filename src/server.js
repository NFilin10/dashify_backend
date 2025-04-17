const express = require('express');
const cors = require('cors')
const authRoute = require('./routes/auth.route')
const layoutRoutes = require('./routes/layout.route');
const freeposRoutes = require('./routes/freepos.routes');
const todoRoute = require('./routes/todo.route');
const widgetRoute = require('./routes/widget.route');


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

app.use('/auth/', authRoute);
app.use('/api/', layoutRoutes);

app.use('/pos/', freeposRoutes);
app.use('/widgets/todo/', todoRoute);






const server = app.listen(port, () => {
    console.log("Server is listening to port " + port);
});


module.exports = server;