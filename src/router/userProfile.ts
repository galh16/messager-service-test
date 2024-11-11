import express from 'express';

import {getAllUsers, deleteUser, updateUser} from '../controllers/userProfile';
import { isAuthenticated, isAdmin } from '../middlewares';

export default (router: express.Router) => {
    router.get('/users', isAuthenticated, getAllUsers)
    router.delete('/user-delete/:id', isAuthenticated, isAdmin, deleteUser)
    router.patch('/user-update/:id', isAuthenticated, updateUser)
}