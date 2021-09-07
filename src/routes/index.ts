import express from 'express';
//import your routes
import images from './api/images';

//create router object
const routes = express.Router();

//set up router object to use your routes
routes.use('/images', images);

//export router object
export default routes;
