import express from 'express';
import morgan from 'morgan';
//import routes
import routes from './routes/index';

//create the server and set the port
const app = express();
const port = 3000;

// const middleware = [morgan, routes]

//setup your app to use the router
app.use(morgan('dev'));
app.use('/api', routes);

//start the server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}/api/images`);
});

export default app;
