import { Request } from "../../../src/core/request";
import { Response } from "../../../src/core/response";

export const userController = async (req: Request, res: Response) => {
    try {
        res.status(200)
            .json({
                message: "User is here"
            })
    } catch (e) {
        res.status(500)
            .json({
                message: "Internal server error"
            })
    }
} 