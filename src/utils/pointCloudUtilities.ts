import axios from 'axios'
import { BufferGeometry, Color, Float32BufferAttribute, Points, PointsMaterial, SRGBColorSpace } from 'three/src/Three.js'
import { decode } from 'tiff'

/**
 * Scale x linearly 0 - 1.0
 * @param x 2.5
 * @param inMin 0
 * @param inMax 5
 * @returns 0.5
 */
const colorMap = (x: number, inMin: number, inMax: number): number => {
    return (x - inMin) / (inMax - inMin)
}

/**
 * @param urlPath address or path to local files.
 * @returns data (.tif) as array buffer
 */
export const getTif = async (urlPath: string) => {
    // responseType: 'arraybuffer' is critical, tiff decode or utiff decode both work on buffers
    const request = axios.get<ArrayBuffer>(urlPath, {responseType: 'arraybuffer'})

    return request
        .then(response => {return response.data})
        .catch(error => {
            console.log('getTif:', error)
            return Promise.reject(error)
        })
}


/**
 * Turn .tif array buffer into geometry, colors and statistics
 * @param data ArrayBuffer
 * @returns geometry, colors for Three.js + statistics from the data
 */
export const tif2pcd = (data: ArrayBuffer) => {
    // the purpose of this function
    // decode .tif file into readable format
    // calculate values like minZ maxZ and mean
    // create xyz array for threejs geometry position
    // create rgb array for threejs geometry color

    // https://github.com/image-js/tiff
    // decode tiff file into readable format 
    const tiff = decode(data)[0]

    let easting = 0
    let northing = 0
    // get easting northing coordinates from decod tiff
    // these coordinates are at the top left of the .tif
    for (const entry of tiff.fields.entries()) {
        if(entry[0] === 33922) {
            easting = entry[1][3]
            northing = entry[1][4]
        }
    }

    // get z min and max for elevation to color linear mapping
    let min_value = Number.MAX_VALUE
    let max_value = 0
    let mean_value = 0
    for(let i = 0; i < tiff.size; i++){
        const z = tiff.data[i]

        if (z > max_value){
            max_value = z
        }

        if (z < min_value){
            min_value = z
        }

        mean_value += z
    }

    mean_value = mean_value / tiff.size

    // tiff.data is a 1 dimensional array: 500x500 file is 250000 long
    // so we loop for y(500), then for x(500) and get z value from index(250000)
    const position = []  // creating x y z array for for 3js geometry
    const color = [] // creating rgb for 3js material?
    const c = new Color()

    let index = 0

    for (let y = 0; y < tiff.height; y++){
        for (let x = 0; x < tiff.width; x++){
            const z = tiff.data[index]

            // geometry
            position.push(y) // x for 3js geometry
            position.push(x) // y for 3js geometry
            position.push(z) // z for 3js geometry

            // color
            const rgb_value = colorMap(z, min_value, max_value)  // z 70m-130m -> 0.0 - 1.0
            c.setRGB(rgb_value, rgb_value, rgb_value, SRGBColorSpace) //rgb values 0.0 - 1.0
            color.push( c.r, c.g, c.b )

            index++
        }
    }

    return {
        geometry: {position, color}, 
        data: {min_value, max_value, mean_value, size: tiff.size, width: tiff.width, height: tiff.height, resolution: tiff.resolutionUnit, easting, northing}
    }
}

interface PCDProps {
    position: number[],
    color: number[]
}

/**
 * @param position array of numbers xyz
 * @param color array of colors rgb
 * @returns Three.js BufferGeometry
 */
export const pcd2points = ({position, color}: PCDProps) => {
    // https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/PCDLoader.js
    // build 3js geometry
    const geometry = new BufferGeometry()

    if ( position.length > 0 ) geometry.setAttribute( 'position', new Float32BufferAttribute( position, 3 ) );
    if ( color.length > 0 ) geometry.setAttribute( 'color', new Float32BufferAttribute( color, 3 ) );

    //geometry.computeBoundingSphere()
    geometry.computeBoundingBox()

    // build material

    const material = new PointsMaterial( { size: 0.005 } )

    if ( color.length > 0 ) {

        material.vertexColors = true;

    }

    // build point cloud
    const returnPoints = new Points( geometry, material )
    /* faster centering, but it screws with other stuff no time to fix for now...
    if(width && height && min_value){
        returnPoints.position.x = -(width/2)
        returnPoints.position.z = -(height/2)
        returnPoints.position.y = -min_value
    }
    */

    return returnPoints
}


/**
 * Scale x linearly to out_min - out_max
 * @param x 5
 * @param in_min 0
 * @param in_max 10
 * @param out_min 1
 * @param out_max 2
 * @returns 1.5
 */
export const arduinoMap = (x: number, in_min: number, in_max: number, out_min: number, out_max: number) => {
    // https://docs.arduino.cc/language-reference/en/functions/math/map/
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}


export const getCoordinate = (x: number, y: number, easting: number, northing: number, width: number, height: number, resolution: number) => {
    const newEasting = (x + (width/2)) * resolution + easting
    const newNorthing = northing - (y + (height/2)) * resolution
    return {easting: newEasting, northing: newNorthing}
}

/**
 * Turn .tif array buffer into geometry, colors and statistics
 * @param data ArrayBuffer of .tiff
 * @returns geometry, colors for Three.js + statistics from the data
 */
export const tif2pcdGradient = (data: ArrayBuffer) => {
    // the purpose of this function
    // decode .tif file into readable format
    // calculate values like minZ maxZ and mean
    // create xyz array for threejs geometry position
    // create rgb array for threejs geometry color

    // https://github.com/image-js/tiff
    // decode tiff file into readable format 
    const tiff = decode(data)[0]

    let easting = 0
    let northing = 0
    // get easting northing coordinates from decod tiff
    // these coordinates are at the top left of the .tif
    for (const entry of tiff.fields.entries()) {
        if(entry[0] === 33922) {
            easting = entry[1][3]
            northing = entry[1][4]
        }
    }

    // get z min and max for elevation to color linear mapping
    let min_value = Number.MAX_VALUE
    let max_value = 0
    let mean_value = 0
    for(let i = 0; i < tiff.size; i++){
        const z = tiff.data[i]

        if (z > max_value){
            max_value = z
        }

        if (z < min_value){
            min_value = z
        }

        mean_value += z
    }

    mean_value = mean_value / tiff.size

    // tiff.data is a 1 dimensional array: 500x500 file is 250000 long
    // so we loop for y(500), then for x(500) and get z value from index(250000)
    const position = []  // creating x y z array for for 3js geometry
    const color = [] // creating rgb for 3js material?
    const c = new Color()

    let index = 0

    for (let y = 0; y < tiff.height; y++){
        for (let x = 0; x < tiff.width; x++){
            const z = tiff.data[index]

            // geometry, changed coordinates order from xyz to xzy...
            position.push(x) // y?? for 3js geometry
            position.push(z) // z?? for 3js geometry
            position.push(y) // x?? for 3js geometry

            // color
            const rgb_value = colorMap(z, max_value, min_value)  // z 70m-130m -> 1.0 - 0.0

            c.setHSL((2/3) * rgb_value, 1, 0.5, SRGBColorSpace)  // HSL color gradient 2/3 = red to blue

            color.push( c.r, c.g, c.b )

            index++
        }
    }

    return {
        geometry: {position, color}, 
        data: {min_value, max_value, mean_value, size: tiff.size, width: tiff.width, height: tiff.height, resolution: tiff.resolutionUnit, easting, northing}
    }
}