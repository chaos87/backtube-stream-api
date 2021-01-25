const express = require('express');
const cors = require('cors');
// const bandcamp = require('bandcamp-scraper');
const bandcamp = require('../bandcamp');
const bandcampStream = require('../bandcamp/stream');

const promisify = f => (...args) => new Promise((a,b)=>f(...args, (err, res) => err ? b(err) : a(res)));

const getAlbumInfo = promisify(bandcamp.getAlbumInfo);
const getAlbumUrls = promisify(bandcamp.getAlbumUrls);
const bandcampSearch = promisify(bandcamp.search);

bandcampRouter = express.Router();

var corsOptions = {
  origin: process.env.CORS_DOMAIN_NAME,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

bandcampRouter.post('/search', function (req, res) {
    return bandcampSearch(req.body).then(
        response => {
            res.send(response)
        }
    )
    .catch(e => res.status(400).send(e.stack))
})

bandcampRouter.post('/albums', function (req, res) {
    return getAlbumUrls(req.body.url).then(
        response => {
            res.send(response)
        }
    )
    .catch(e => res.status(400).send(e.stack))
})

bandcampRouter.post('/songs', function (req, res) {
    return getAlbumInfo(req.body.url).then(
        response => {
            res.send(response)
        }
    )
    .catch(e => res.status(400).send(e.stack))
  })

bandcampRouter.get('/stream', cors(corsOptions), function (req, res) {
    bandcampStream.getTrack(req.query.url).then(function(stream) {
        stream.pipe(res)
    }).catch(function(err) {
        res.status(500).json({message: err.message})
    });
})


 module.exports = bandcampRouter;
