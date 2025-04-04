const cors = require('cors');
const routes = require('./routes');
const morgan = require('morgan');
const express = require('express')
const path = require('path')
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({extended:true}))

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/', async (req, res) => {
    res.status(200).json({
        message: 'Welcome to BeFitOutfit'
    })
})
routes(app)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});