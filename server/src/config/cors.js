import cors from 'cors';

const allowedOrigins = [
  'http://localhost:3000', // Local development
  'https://interview-nu-weld.vercel.app', // Replace with your actual Vercel domain
  "https://master.d2uy7h19d22ty2.amplifyapp.com"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};


export default cors(corsOptions);
