import express from 'express';
import cors from 'cors';
import router from './routes'

const app=express()

const allowedOrigins = [
  'https://anshika.vaamsolution.com',
  'https://taskify-tasks.netlify.app',
];

if (process.env.NODE_ENV === 'production') {
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));
  console.log("Using production CORS");
} else {
  app.use(cors());
  console.log("Using development CORS");
}

app.use(express.json());

app.use('/api/v1',router)
app.listen(3000)