import express from 'express';

import {addTimeZone} from '../controllers/timeZone';
import { isAuthenticated, isAdmin } from '../middlewares';

export default (router: express.Router) => {
    router.post("/timezone/add", isAuthenticated, isAdmin, addTimeZone);
}