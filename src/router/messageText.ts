import express from 'express';

import {addMessageText} from '../controllers/messageText';
import { isAuthenticated, isAdmin } from '../middlewares';

export default (router: express.Router) => {
    router.post("/message-text/add", isAuthenticated, isAdmin, addMessageText);
}