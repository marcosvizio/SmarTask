import 'dotenv/config';
import app from './app.js';
import './scheduler.js'

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));