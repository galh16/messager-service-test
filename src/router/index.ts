import express from 'express';

import authentication from './authentication';
import userProfile from './userProfile';
import timeZone from './timeZone';
import messageText from './messageText';

const router = express.Router();

export default (): express.Router => {
    authentication(router);
    userProfile(router);
    timeZone(router);
    messageText(router);
    return router;
};