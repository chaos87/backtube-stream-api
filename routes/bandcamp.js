const express = require('express');
const cors = require('cors');
// const bandcamp = require('bandcamp-scraper');
const bandcamp = require('../bandcamp');
const bandcampStream = require('../bandcamp/stream');
const { promisify } = require('util');

const getAlbumInfo = promisify(bandcamp.getAlbumInfo);
const getAlbumUrls = promisify(bandcamp.getAlbumUrls);
const bandcampSearch = promisify(bandcamp.search);

bandcampRouter = express.Router();

var corsOptions = {
  origin: process.env.CORS_DOMAIN_NAME,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

bandcampRouter.get('/stream', cors(corsOptions), function (req, res) {
    bandcampStream.getTrack(req.query.url).then(function(stream) {
        stream.pipe(res)
    }).catch(function(err) {
        res.status(500).json({message: err.message})
    });
})


 module.exports = bandcampRouter;
