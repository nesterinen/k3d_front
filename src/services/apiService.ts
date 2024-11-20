import axios from 'axios'
import { backEndUrl } from '../utils/config'

const getTifFile = async (latitude: number, longitude: number, size=1000): Promise<ArrayBuffer> => {
    return await axios.post(
        backEndUrl + '/api/v1/korkeusmalli2m',
        { latitude, longitude, size },
        { responseType: 'arraybuffer' }
    ).then(result => {
        return result.data
    })
}

export default getTifFile