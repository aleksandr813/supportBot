const express = require('express');
const CONFIG = require('./config');

const { PORT } = CONFIG;

const app = express();

app.use(express.json());

app.listen(PORT, (error) =>{
    if(!error)
        console.log(`Server is started at PORT ${PORT}`);
    else 
        console.log("Error occurred, server can't start", error);
    }
);