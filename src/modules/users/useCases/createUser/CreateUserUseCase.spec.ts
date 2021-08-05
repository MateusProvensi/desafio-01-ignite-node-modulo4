import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create a user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to create a new user", async () => {
    const user = {
      name: "User Test",
      email: "user@gmail.com",
      password: "12345",
    };

    await createUserUseCase.execute({
      email: user.email,
      name: user.name,
      password: user.password,
    });

    const userCreated = await inMemoryUsersRepository.findByEmail(user.email);

    expect(userCreated).toHaveProperty("id");
  });

  it("Should not be able to create a new user with a email existent", () => {
    expect(async () => {
      const user = {
        name: "User Test",
        email: "user@gmail.com",
        password: "1234",
      };

      await createUserUseCase.execute({
        email: user.email,
        name: user.name,
        password: user.password,
      });

      await createUserUseCase.execute({
        email: user.email,
        name: user.name,
        password: user.password,
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
