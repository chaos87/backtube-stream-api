const express = require('express');
const ytdl = require('ytdl-core')
const FFmpeg = require('fluent-ffmpeg')
const { PassThrough } = require('stream')
const fs = require('fs')

youtubeRouter = express.Router();

var corsOptions = {
  origin: process.env.CORS_DOMAIN_NAME,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

youtubeRouter.get('/stream', (req, res) => {
    const requestUrl = `http://youtube.com/watch?v=${req.query.videoId}`
    res.setHeader('Access-Control-Allow-Origin', '*');
    opt = { isHLS: true }
    const video = ytdl(requestUrl, opt)
    const { file, audioFormat } = opt
    let stream = file ? fs.createWriteStream(file) : new PassThrough()
    const ffmpeg = new FFmpeg(video)
    process.nextTick(() => {
      const output = ffmpeg.format('mp3').pipe(stream)
      ffmpeg.on('error', error => {
          stream.emit('error', error)
          video.end()
          console.log('Error with video ', req.query.videoId, error.message)
          res.status(500).json({message: error.message})
      })
    })

    stream.video = video
    stream.ffmpeg = ffmpeg
    stream.pipe(res)
});

youtubeRouter.get('/info', async (req, res) => {
    let info = await ytdl.getBasicInfo(req.query.videoId);
    res.json(info)
})

module.exports = youtubeRouter;
