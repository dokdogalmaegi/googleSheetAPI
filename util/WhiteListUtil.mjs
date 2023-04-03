import { FailResponseData } from '../util/ResponseUtil.mjs';

import ipWhiteList from '../config/ipWhiteList.json' assert { type: 'json' };

export function validationWhiteList(req, res, next) {
    const ipAddress = (req.headers['x-real-ip'] || req.headers['x-forwarded-for'] ||  req.socket.remoteAddress).replaceAll(':', '').replaceAll('f', '');
    try {
        const isExists = ipWhiteList.whiteList.filter(whiteAddress => whiteAddress === ipAddress);

        if (isExists.length === 0) {
            console.log(ipAddress);
            throw Error('Not exists ip address in white list');
        }
    } catch(error) {
        console.log(error);

        const returnFailData = new FailResponseData(`Blocked Ip`, error);
        return res.json(returnFailData.json);
    }
    next();
}