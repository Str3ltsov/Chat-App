import mongoose from 'mongoose';

const connectToDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongoose: Successfully established connection to MongoDB");
    }
    catch (err) {
        console.error(`Mongoose: ${err}`);
    }
}

export default connectToDb;
