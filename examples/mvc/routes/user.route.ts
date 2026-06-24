import { userController } from '../controller/user.controller';
import { Router } from '../../../src/core/router'

export function userRoutes(router: Router) {
  router.get('/users', userController);
}