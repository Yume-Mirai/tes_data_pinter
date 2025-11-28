import { InMemoryUserRepository } from "../infra/InMemoryUserRepository";
import { InMemoryTodoRepository } from "../infra/InMemoryTodoRepository";
import { SimpleScheduler } from "../infra/SimpleScheduler";
import { ExpressHttpServer } from "../infra/ExpressHttpServer";
import { TodoService } from "../core/TodoService";
import {
  createUserHandler,
  createTodoHandler,
  completeTodoHandler,
  getUserHandler,
  getTodoHandler,
  updateTodoHandler,
  deleteTodoHandler,
  getUserTodosHandler,
  shareTodoHandler,
  getAllUsersHandler,
  getAllTodosHandler
} from "./handlers";

async function bootstrap() {
  // Wire up dependencies
  const userRepo = new InMemoryUserRepository();
  const todoRepo = new InMemoryTodoRepository();
  const scheduler = new SimpleScheduler();
  const todoService = new TodoService(todoRepo, userRepo);
  const httpServer = new ExpressHttpServer();

  // Register API routes - more specific routes first
  httpServer.registerRoute('GET', '/users/:userId/todos', getUserTodosHandler(todoService));
  httpServer.registerRoute('GET', '/users/:id', getUserHandler(userRepo));
  httpServer.registerRoute('GET', '/users', getAllUsersHandler(userRepo));
  httpServer.registerRoute('POST', '/users', createUserHandler(todoService, userRepo));

  httpServer.registerRoute('POST', '/todos/:id/share', shareTodoHandler(todoService, userRepo));
  httpServer.registerRoute('PATCH', '/todos/:id/complete', completeTodoHandler(todoService));
  httpServer.registerRoute('PUT', '/todos/:id', updateTodoHandler(todoService));
  httpServer.registerRoute('DELETE', '/todos/:id', deleteTodoHandler(todoService));
  httpServer.registerRoute('GET', '/todos/:id', getTodoHandler(todoService));
  httpServer.registerRoute('POST', '/todos', createTodoHandler(todoService));

  httpServer.registerRoute('GET', '/todos', getAllTodosHandler(todoService));

  // Schedule reminder processing every 60 seconds
  scheduler.scheduleRecurring('reminder-check', 60000, async () => {
    console.log('Processing reminders...');
    await todoService.processReminders();
  });

  // Start HTTP server
  await httpServer.listen(3000);

  console.log("Todo Reminder Service - Bootstrap Complete");
  console.log("HTTP server running on port 3000");
  console.log("Reminder processing scheduled every 60 seconds");
}

bootstrap().catch(console.error);
