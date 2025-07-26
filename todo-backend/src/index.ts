import express from 'express';
import cors from 'cors';
import router from './routes'

const app=express()
// app.use(cors({
//   origin: 'https://anshika.vaamsolution.com',
//   credentials: true,
// }));
// app.use(cors())
if (process.env.NODE_ENV === 'production') {
  app.use(cors({
    origin: 'https://anshika.vaamsolution.com',
    credentials: true,
  }));
  console.log("Using production CORS");
} else {
  app.use(cors());
  console.log("Using development CORS");
}
app.use(express.json())

app.use('/api/v1',router)
app.listen(3000)