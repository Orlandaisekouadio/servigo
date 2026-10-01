import mongoose from 'mongoose';

let connected = false;

export function dbStatus() {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  return { state: mongoose.connection.readyState, connected };
}

export async function connectDb(uri) {
  if (!uri) {
    console.warn('[db] MONGO_URI absent — démarrage sans base (mode dégradé).');
    return { skipped: true };
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  connected = true;
  console.log('[db] MongoDB connecté.');
  return { skipped: false };
}

export async function disconnectDb() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    connected = false;
  }
}
