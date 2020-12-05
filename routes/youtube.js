const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core')
const FFmpeg = require('fluent-ffmpeg')
const { PassThrough } = require('stream')
const fs = require('fs')

youtubeRouter = express.Router();

var corsOptions = {
  origin: process.env.CORS_DOMAIN_NAME,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

youtubeRouter.get('/stream', cors(corsOptions), (req, res) => {
    const requestUrl = `http://youtube.com/watch?v=${req.query.videoId}`
    res.setHeader('Access-Control-Allow-Origin', '*');
    opt = {
        audioFormat: 'mp3',
        quality: 'lowestaudio'
    }
    const video = ytdl(requestUrl, opt)
    const { file, audioFormat } = opt
    let stream = file ? fs.createWriteStream(file) : new PassThrough()
    const ffmpeg = new FFmpeg(video)
    process.nextTick(() => {
      const output = ffmpeg.format(audioFormat).pipe(stream)
      ffmpeg.on('error', error => {
          stream.emit('error', error)
          video.end()
          console.log('Error with video ', req.query.videoId, error.message)
          res.status(500).send(error.message);
      })
    })

    stream.video = video
    stream.ffmpeg = ffmpeg
    stream.pipe(res)
});

youtubeRouter.get('/info', cors(corsOptions), async (req, res) => {
    let info = await ytdl.getBasicInfo(req.query.videoId);
    res.json(info)
})

module.exports = youtubeRouter;
