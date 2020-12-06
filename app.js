if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require("express");
const cors = require('cors');
var bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const youtubeRoutes = require('./routes/youtube');
const bandcampRoutes = require('./routes/bandcamp');

app.use('/youtube', youtubeRoutes);
app.use('/bandcamp', bandcampRoutes);

app.get('/health', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send({"message": "alive & kicking!"})
});

app.listen(process.env.PORT || 5000, () => console.log(`Example app listening at http://localhost:5000`))
