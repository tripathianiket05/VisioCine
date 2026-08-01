import dotenv from 'dotenv';
dotenv.config();
console.log('CWD:', process.cwd());
console.log('KEY:', process.env.TMDB_API_KEY);
