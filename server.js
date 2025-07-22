const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const User = require('./models/User');

const app = express();
const PORT = 3000;

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/authDB')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'secretKey',
  resave: false,
  saveUninitialized: false
}));

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Signup Route
app.post('/signup', async (req, res) => {
  console.log('Incoming form data:', req.body);

  const { fullName, email, username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = new User({ fullName, email, username, password: hashedPassword });
    await user.save();
    req.session.userId = user._id;
    console.log('✅ User saved!');
    res.send('✅ Signup successful. You are now logged in!');
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(400).send('❌ Signup failed. Try again.');
  }
});

// Login Route with Debug
app.post('/login', async (req, res) => {
  console.log('Login form data:', req.body); // ✅ See what's submitted

  const { username, password } = req.body;
  const user = await User.findOne({ username });

  console.log('User found in DB:', user); // ✅ Check user lookup

  if (!user) return res.status(400).send('❌ Invalid username or password');

  const isMatch = await bcrypt.compare(password, user.password);
  console.log('Password match:', isMatch); // ✅ Show compare result

  if (!isMatch) return res.status(400).send('❌ Invalid username or password');

  req.session.userId = user._id;
  res.send('✅ Login successful!');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
