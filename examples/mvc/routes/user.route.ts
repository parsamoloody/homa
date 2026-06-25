import { Router } from '../../../src/core/router'
import { UserController } from '../controller/user.controller';

const userController = new UserController();

export function userRoutes(router: Router) {
  router.get('/user/:id', userController.getById);
  router.get('/users', userController.getAll);
  router.post('/add/user', userController.createOne);
}