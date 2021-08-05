import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show The User Profile", () =>{
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  })

  it("Should be able to show The User Profile", async () => {
    await createUserUseCase.execute({
      email: "test@gmail.com",
      name: "testName",
      password: "123",
    })

    const user = await inMemoryUsersRepository.findByEmail("test@gmail.com");

    const userProfile = await showUserProfileUseCase.execute(user!.id!);

    expect(userProfile).toHaveProperty("id")
  });

  it("Should not be able to show the user profile from a user doesn't exists", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("incorrectId")
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  })
});
