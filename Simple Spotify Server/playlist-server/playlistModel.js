import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artists: { type: [String], required: true },
  url: { type: String, required: true },
  playCount: { type: Number, default: 0 },
});

const playlistSchema = new mongoose.Schema({
  songs: [songSchema],
});

const Playlist = mongoose.model('Playlist', playlistSchema);

export default Playlist;