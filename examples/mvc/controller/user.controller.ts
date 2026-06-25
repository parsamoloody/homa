import { Request } from "../../../src/core/request";
import { Response } from "../../../src/core/response";
import { UserModel } from "../model/user.model";

export class UserController {
    private userModel = new UserModel();

    getById = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;

            const user = this.userModel.findById(Number(id))
            if (!user) {
                return res.status(404)
                    .json({
                        message: `User not found with id: ${id}`
                    })
            }
            res.status(200)
                .json(user)

        } catch (e) {
            res.status(500)
                .json({
                    message: "Internal server error"
                })
        }
    }
    getAll = async (req: Request, res: Response) => {
        try {
            const users = this.userModel.findAll();
            res.status(200)
                .json(users)
        } catch (e) {
            res.status(500)
                .json({
                    message: "Internal server error"
                })
        }
    }
    createOne = async (req: Request, res: Response) => {
        try {
            const {name, email} = req.body;
            if(!name || !email){
                return res.status(400)
                .json({
                    message: "name and email are required"
                })
            }
            const user = this.userModel.create({name, email});
            res.status(201)
                .json({
                    message: "User created",
                    data: user
                })
        } catch (e) {
            res.status(500)
                .json({
                    message: "Internal server error"
                })
        }
    }

}

