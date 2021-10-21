# Image Processing App
The app provides resized images from the images in its image store.

## Installation
- clone repository
```shell
git clone https://github.com/w314/imageProcessingApp.git
```
- install dependecies
```shell
npm install
```
- start project
```shell
npm start
```

## How to use the app

Open your browser at
```shell
http://localhost:3000/api/images?file=fjord&width=600&height=400
```
The application will serve you a resized image of fjord.jpg with width 600 and height 400.
To use different images or width or height parameter change them in the url.

If no width and height parameters are provided the application serves the original image from its directory. If you provide either width or height or both of those parameters the application serves a thumb image resized according the provided parameters. Created thumb images are saved under the thumbs directory and when asking for a previously created thumb images they are served from there and are not recretated.


## Available images and NPM srcipts to run

There are 5 original images to use for resizing under the images directory and one thumb under the thumbs directory for testing purposes.

### Available images in assets/images directory
- encenadaport.jpg
- fjord.jpg
- icelandwaterfall.jpg
- palmtunnel.jpg
- santamonica.jpg

### Available thumbs in assets/thumbs directory
- palmtunnel_300x200.jpg

### Available NPM scripts
- npm start
- npm run prettier
- npm run lint
- npm test (builds the application and runs the test cases)