import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import Playlist from './models/playlistModel.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Successfully connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

app.use(bodyParser.json());

// Add a song to the playlist
app.post('/playlist/add', async (req, res) => {
  const { title, artists, url } = req.body;

  if (!title || !artists || !url) {
    return res.status(400).json({ error: 'Title, artists, and URL are required' });
  }

  try {
    const playlist = await Playlist.findOne();
    if (!playlist) {
      const newPlaylist = new Playlist({ songs: [{ title, artists, url }] });
      await newPlaylist.save();
    } else {
      playlist.songs.push({ title, artists, url });
      await playlist.save();
    }

    res.json({ message: 'Song added to the playlist' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Play a song from the playlist
app.get('/playlist/play/:id', async (req, res) => {
  const songId = req.params.id;

  try {
    const playlist = await Playlist.findOne({ 'songs._id': songId });
    if (!playlist) {
      return res.status(404).json({ error: 'Song not found in the playlist' });
    }

    const song = playlist.songs.id(songId);
    song.playCount++;
    await playlist.save();

    res.json(song);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get list of songs from the playlist
app.get('/playlist', async (req, res) => {
  try {
    const playlist = await Playlist.findOne();
    if (!playlist) {
      return res.json([]);
    }

    res.json(playlist.songs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get list of songs sorted by most played
app.get('/playlist/most-played', async (req, res) => {
  try {
    const playlist = await Playlist.findOne();
    if (!playlist) {
      return res.json([]);
    }

    const sortedSongs = playlist.songs.sort((a, b) => b.playCount - a.playCount);
    res.json(sortedSongs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(port, () => console.log(`Server running on port: http://localhost:${port}`));