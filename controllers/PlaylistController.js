const PlaylistModel = require('../models/Playlist');
const TrackModel = require('../models/Track');
const UserModel = require('../models/User');
const getUserId = require('../helpers/cognito');

const PlaylistController = {
    find: async (req, res) => {
        let found = await PlaylistModel.findById(req.params.id);
        res.json(found);
    },
    getRecent: async (req, res) => {
        const limit = req.query.limit ? req.query.limit : 20;
        let found = await PlaylistModel.find({}).sort({'updatedAt': -1})
            .limit(req.query.limit)
            .populate('tracks')
            .populate('creator', 'username avatar');
        res.json(found);
    },
    all: async (req, res) => {
        let allPlaylists = await PlaylistModel.find();
        res.json(allPlaylists);
    },
    create: async (req, res) => {
        let user = await getUserId(req.headers.accesstoken);
        const tracks = req.body.tracks;
        let newPlaylist = new PlaylistModel({
            title: req.body.title,
            creator: user,
            tracks: tracks.map(track => track._id)
        });
        tracks.map(track => {
            // check track exists, if yes retrieve _id
            // else create the track and retrieve _id
            TrackModel.findByIdAndUpdate(
                track._id,
                Object.assign(track, {$push: { playlists: newPlaylist }}),
                {
                    upsert: true, new: true, setDefaultsOnInsert: true,
                    useFindAndModify: false
                },
            )
            .catch(err => {
                res.status(400).json({success: false, message: err.message})
            });
        });
        UserModel.findByIdAndUpdate(
            user,
            {$push: { playlistsOwned: newPlaylist }},
            {
                useFindAndModify: false
            },
        ).catch(err => {
            res.status(400).json({success: false, message: err.message})
        });
        newPlaylist.save()
            .then(data => {
                res.json(data);
            })
            .catch(err => {
                res.status(400).json({success: false, message: err.message})
            });
    },
    update: async (req, res) => {
        let found = await PlaylistModel.findById(req.params.id);
        const tracks = req.body.tracks;
        found.tracks = tracks.map(track => track._id);
        //check token is authorized
        let user = await getUserId(req.headers.accesstoken);
        if (user !== found.creator){
            res.status(403).json({success: false, message: 'User not authorized.'})
            return;
        }
        tracks.map(track => {
            // check track exists, if yes retrieve _id
            // else create the track and retrieve _id
            TrackModel.findByIdAndUpdate(
                track._id,
                Object.assign(track, {$addToSet: { playlists: req.params.id}}),
                {
                    upsert: true, new: true, setDefaultsOnInsert: true,
                    useFindAndModify: false
                },
            )
            .catch(err => {
                res.status(400).json({success: false, message: err.message})
            });

        })
        found.title = req.body.title;
        found.save().then(data => {
            res.json(data);
        }).catch(err => {
            res.status(400).json({success: false, message: err.message})
        })

    },
    delete: async (req, res) => {
        let found = await PlaylistModel.findById(req.params.id)
        //check token is authorized
        let user = await getUserId(req.headers.accesstoken);
        if (user !== found.creator){
            res.status(403).json({success: false, message: 'User not authorized.'})
            return;
        }
        await found.tracks.map(track => {
            // check track exists, if yes retrieve _id
            // else create the track and retrieve _id
            TrackModel.findByIdAndUpdate(
                track,
                {$pull: { playlists: req.params.id}},
                {
                    safe: true,
                    useFindAndModify: false
                },
            ).then(data => {
                if (data.playlists.length === 1 && data.playlists[0].toString() === req.params.id) {
                    console.log('DELETE', data.title)
                    TrackModel.findByIdAndDelete(data._id).catch(err => {
                        res.status(400).json({success: false, message: err.message})
                    });
                }
            })
            .catch(err => {
                res.status(400).json({success: false, message: err.message})
            });

        });
        await UserModel.findByIdAndUpdate(
            user,
            {$pull: { playlistsOwned: req.params.id }},
            {
                useFindAndModify: false
            },
        ).catch(err => {
            res.status(400).json({success: false, message: err.message})
        });
        PlaylistModel.findByIdAndDelete(req.params.id)
        .catch(err => {
            res.status(400).json({success: false, message: err.message})
        }).then(data => {
            res.json(data)
        })
    },
    getCreator: async (req, res) => {
        let found = await PlaylistModel.findById(req.params.id).populate("creator");
        res.json(found);
    },
    getFollowers: async (req, res) => {
        let found = await PlaylistModel.findById(req.params.id).populate("followers");
        res.json(found);
    },
    getTracks: async (req, res) => {
        let found = await PlaylistModel.findById(req.params.id).populate("tracks");
        res.json(found);
    },
    addFollower: async (req, res) => {
        let found = await PlaylistModel.findById(req.params.id);
        //check token is authorized
        let user = await getUserId(req.headers.accesstoken);
        // get User
        let userObj = await UserModel.findById(user)
        if (!found.followers.includes(user)) {
            found.followers.push(user);
        }

        if (!userObj.playlistsFollowed.includes(found._id)) {
            userObj.playlistsFollowed.push(found._id);
        }
        await found.save().catch(err => {
            res.status(400).json({success: false, message: err.message})
        })
        userObj.save().then(data => {
            res.json(data);
        }).catch(err => {
            res.status(400).json({success: false, message: err.message})
        })
    },
    removeFollower: async (req, res) => {
        let found = await PlaylistModel.findById(req.params.id);
        //check token is authorized
        let user = await getUserId(req.headers.accesstoken);
        // get User
        let userObj = await UserModel.findById(user)
        if (found.followers.includes(user)) {
            found.followers.pull(user);
        }
        if (userObj.playlistsFollowed.includes(found._id)) {
            userObj.playlistsFollowed.pull(found._id);
        }
        await found.save().catch(err => {
            res.status(400).json({success: false, message: err.message})
        })
        userObj.save().then(data => {
            res.json(data);
        }).catch(err => {
            res.status(400).json({success: false, message: err.message})
        })
    },
    search: async (req, res) => {
        let playlistResultFromPlaylist = await PlaylistModel.find({$text: {$search: req.body.searchString}})
            .populate('tracks')
            .populate('creator');
        let playlistResultFromTrack = await TrackModel.find({$text: {$search: req.body.searchString}}).populate({
            path: "playlists",
            populate: [{ path: 'tracks' },{ path: 'creator', select: 'username avatar'}]
        })

        let playlistResultFromTrackOnlyPlaylists = await playlistResultFromTrack.map(el => el.playlists).flat()
        playlistResultFromTrackOnlyPlaylists = await playlistResultFromTrackOnlyPlaylists.filter((v,i,a)=>a.findIndex(t=>(t._id.toString() === v._id.toString()))===i)
        let finalResults = await Array(playlistResultFromTrackOnlyPlaylists, playlistResultFromPlaylist).flat();
        let finalResultsDeduped = await finalResults.filter((v,i,a)=>a.findIndex(t=>(t._id.toString() === v._id.toString()))===i);
        res.json(finalResultsDeduped)
    }
}

module.exports = PlaylistController;
