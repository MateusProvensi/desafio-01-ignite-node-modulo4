import { OperationType } from "@modules/statements/entities/Statement";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get a statement operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("Should be able to show a statement by id", async () => {
    const user = {
      name: "Test",
      email: "test@test.com",
      password: "123",
    };

    const userCreated = await createUserUseCase.execute({
      email: user.email,
      password: user.password,
      name: user.name,
    });

    const statement = {
      user_id: userCreated.id,
      type: "deposit",
      amount: 50,
      description: "depositTest",
    };

    const statementCreated = await createStatementUseCase.execute({
      user_id: statement.user_id!,
      type: OperationType.DEPOSIT,
      amount: statement.amount,
      description: statement.description,
    });

    expect(statementCreated).toHaveProperty("id");

    const statementFounded = await getStatementOperationUseCase.execute({
      user_id: userCreated.id!,
      statement_id: statementCreated.id!,
    });

    expect(statementFounded).toHaveProperty("id");
  });

  it("Should not be able to show a statement by id from a statement does not exists", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "incorrectId",
        statement_id: "incorrectId",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });
});
