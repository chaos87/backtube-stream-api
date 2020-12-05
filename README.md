# BackTube

[BackTube](https://backtube.app) is a streaming app for music lovers who can create and follow playlists of their favorite songs from Youtube or Bandcamp.

There are 4 different repositories:
- [UI](https://github.com/chaos87/backtube-ui)
- [Backend API](https://github.com/chaos87/backtube-backend-api)
- Stream API (this repository)
- [Youtube Music Search API](https://github.com/chaos87/backtube-ytmusic-api)

## Installation

Use the package manager [npm](https://www.npmjs.com/get-npm) to install the UI.

```bash
npm install
```

## Usage

```bash
npm start
```

And then type in the URL directly in the browser:
http://localhost:5000/youtube/stream?videoId=TPxukQ7lH94

## Endpoints

Set environment variable with domain name for CORS

```bash
export CORS_DOMAIN_NAME=http://localhost:5000
```

- [GET] /youtube/stream?videoId=<id>: stream youtube audio from video with id <id> (CORS protected)
- [GET] /youtube/info?videoId=<id>: get video metadata from video with id <id> (CORS protected)
- [POST] /bandcamp/search: search for artists/albums/songs/labels (payload: {"query": YOUR_QUERY})
- [POST] /bandcamp/albums: get all albums of an artist (payload: {"url": ARTIST_URL})
- [POST] /bandcamp/songs: Retrieve all tracks (payload: {"url": ALBUM_URL})
- [GET] /bandcamp/stream?url=<track_url>: stream bandcamp track (CORS protected)

## Live server

Currently deployed on Heroku https://api-backtube-stream.herokuapp.com.
Please note that both of the stream endpoints are not opened to public (CORS protected).
Only BackTube UI can query those at the moment.

## Dependencies

- [Express](https://expressjs.com/)
- [ytdl-core](https://github.com/fent/node-ytdl-core)
- [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)

## Contributing
Please open an issue prior to submitting a pull request, so that we can discuss whether it makes sense to be implemented or not.
Feature ideas or bug reports are more than welcome!

## License
[MIT](https://choosealicense.com/licenses/mit/)
