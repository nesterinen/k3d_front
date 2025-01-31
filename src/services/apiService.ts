import axios from 'axios'
import { backEndUrl } from '../utils/config'

// /api/v1/korkeusmalli2m uses ogc api process which is really slow...
/*
const getTifFile = async (latitude: number, longitude: number, size=1000): Promise<ArrayBuffer> => {
    return await axios.post(
        backEndUrl + '/api/v1/korkeusmalli2m',
        { latitude, longitude, size },
        { responseType: 'arraybuffer' }
    ).then(result => {
        return result.data
    })
}
*/

export const getTifFile = async (latitude: number, longitude: number, size=1000): Promise<ArrayBuffer> => {
    return await axios.post(
        backEndUrl + '/wcs/v1/korkeusmalli_2m',
        { latitude, longitude, size },
        { responseType: 'arraybuffer' }
    ).then(result => {
        return result.data
    })
}

export default getTifFile