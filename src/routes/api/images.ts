import express from 'express';
import processor from '../utilities/imageProcessor';

//create router object
const images = express.Router();

//set up route
images.get('/', processor, () => {
  // res.send('Application starting page');
});

//export route
export default images;
