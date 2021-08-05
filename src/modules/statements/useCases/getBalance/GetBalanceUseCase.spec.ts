import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get the user balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("Should be able to get the user balance", async () => {
    const user = {
      name: "Test",
      email: "test@test.com",
      password: "123",
    };

    const userCreated = await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    const userBalance = await getBalanceUseCase.execute({
      user_id: userCreated.id!,
    });

    expect(userBalance).toHaveProperty("balance");
  });

  it("Should not be able to get user balance from a user that doesn't exist", () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "incorrectId",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
