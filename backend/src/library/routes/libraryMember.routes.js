import { createCrudRouter } from "./createCrudRouter.js";
import { libraryMemberController } from "../controllers/libraryMember.controller.js";

export default createCrudRouter(libraryMemberController);
