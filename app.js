const express = require('express');
const sequelize = require('./util/db');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/user');
const app = express();
app.use(cors());
app.use(bodyParser.json({ extended: false }));

app.use('/user', userRoutes);

sequelize.sync()
    .then(() => {
        app.listen(3000);
    })
    .catch(err => console.log('Error at sequelize.sync()', err))
