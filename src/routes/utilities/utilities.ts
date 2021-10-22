import sharp from 'sharp'
import path from 'path'

const resizeImage = ((inputFile:string, width: string, height: string, outputFile:string) => {
    // converting string width or height to number if they are defined
    const resizeWidth =
        width == undefined ? undefined : parseInt(width as string, 10);
    const resizeHeight = 
        height == undefined
        ? undefined
        : parseInt(height as string, 10);
    // resizing image
    return  sharp(inputFile)
    .resize(resizeWidth, resizeHeight, {
        fit: 'cover',
    })
    .toFile(outputFile)
})

export default resizeImage