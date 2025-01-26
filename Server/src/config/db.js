import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log('Mongoose default connection is open');
    });

    await mongoose.connect(process.env.DATABASE_URL);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err);
  }
}

export default connectDB;