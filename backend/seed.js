import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Incident from './models/Incident.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/crisis_management')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

const importData = async () => {
  try {
    await User.deleteMany();
    await Incident.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = [
      {
        name: 'Admin User',
        email: 'admin@crisis.com',
        password: hashedPassword,
        role: 'admin'
      },
      {
        name: 'John Doe',
        email: 'user@crisis.com',
        password: hashedPassword,
        role: 'user'
      },
      {
        name: 'Rescue Team A',
        email: 'responder@crisis.com',
        password: hashedPassword,
        role: 'responder'
      }
    ];

    await User.insertMany(users);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
