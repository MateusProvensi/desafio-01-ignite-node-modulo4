import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate a User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("Should be able Authenticate a user exists", async () => {
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

    const userAuthenticated = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(userAuthenticated).toHaveProperty("token");
  });

  it("Should not be able authenticate a user with a incorrect email", () => {
    expect(async () => {
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

      await authenticateUserUseCase.execute({
        email: "incorrectEmail@gmail.com",
        password: user.password,
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be able authenticate a user with a incorrect password", () => {
    expect(async () => {
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

      await authenticateUserUseCase.execute({
        email: user.email,
        password: "incorrectPassword",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
