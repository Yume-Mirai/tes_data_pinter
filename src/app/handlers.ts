import { Request, Response } from 'express';
import { TodoService } from '../core/TodoService';
import { InMemoryUserRepository } from '../infra/InMemoryUserRepository';

export function createUserHandler(_todoService: TodoService, userRepo: InMemoryUserRepository): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, name } = req.body;

      if (!email || !name) {
        res.status(400).json({ error: 'Email and name are required' });
        return;
      }

      const user = await userRepo.create({ email, name });
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export function createTodoHandler(todoService: TodoService): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, title, description, remindAt } = req.body;

      if (!userId || !title) {
        res.status(400).json({ error: 'userId and title are required' });
        return;
      }

      const todo = await todoService.createTodo({ userId, title, description, remindAt });
      res.status(201).json(todo);
    } catch (error: any) {
      if (error.message === 'Title is required and cannot be empty' ||
          error.message === 'User not found') {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export function getTodosHandler(todoService: TodoService): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, limit, offset } = req.query;

      if (!userId || typeof userId !== 'string') {
        res.status(400).json({ error: 'userId query parameter is required' });
        return;
      }

      const limitNum = limit ? parseInt(limit as string, 10) : undefined;
      const offsetNum = offset ? parseInt(offset as string, 10) : undefined;

      const todos = await todoService.getTodosByUser(userId, limitNum, offsetNum);
      res.json(todos);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export function completeTodoHandler(todoService: TodoService): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: 'Todo ID is required' });
        return;
      }

      const todo = await todoService.completeTodo(id);
      res.json(todo);
    } catch (error: any) {
      if (error.message === 'Todo not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export function getUserHandler(userRepo: InMemoryUserRepository): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const user = await userRepo.findById(id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export function getTodoHandler(todoService: TodoService): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: 'Todo ID is required' });
        return;
      }

      const todo = await todoService.getTodoById(id);
      if (!todo) {
        res.status(404).json({ error: 'Todo not found' });
        return;
      }

      res.json(todo);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export function updateTodoHandler(todoService: TodoService): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, description, remindAt } = req.body;

      if (!id) {
        res.status(400).json({ error: 'Todo ID is required' });
        return;
      }

      const updates: any = {};
      if (title !== undefined) {
        if (!title || title.trim() === "") {
          res.status(400).json({ error: 'Title cannot be empty' });
          return;
        }
        updates.title = title.trim();
      }
      if (description !== undefined) updates.description = description;
      if (remindAt !== undefined) {
        updates.remindAt = remindAt ? new Date(remindAt) : null;
      }

      const todo = await todoService.updateTodo(id, updates);
      if (!todo) {
        res.status(404).json({ error: 'Todo not found' });
        return;
      }

      res.json(todo);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export function deleteTodoHandler(todoService: TodoService): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ error: 'Todo ID is required' });
        return;
      }

      const success = await todoService.deleteTodo(id);
      if (!success) {
        res.status(404).json({ error: 'Todo not found' });
        return;
      }

      res.status(204).send(); // No Content
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export function getUserTodosHandler(todoService: TodoService): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { limit, offset } = req.query;

      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const limitNum = limit ? parseInt(limit as string, 10) : undefined;
      const offsetNum = offset ? parseInt(offset as string, 10) : undefined;

      const todos = await todoService.getTodosByUser(userId, limitNum, offsetNum);
      res.json(todos);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export function shareTodoHandler(todoService: TodoService, userRepo: InMemoryUserRepository): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { targetUserId } = req.body;

      if (!id) {
        res.status(400).json({ error: 'Todo ID is required' });
        return;
      }

      if (!targetUserId) {
        res.status(400).json({ error: 'Target user ID is required' });
        return;
      }

      // Check if target user exists
      const targetUser = await userRepo.findById(targetUserId);
      if (!targetUser) {
        res.status(404).json({ error: 'Target user not found' });
        return;
      }

      const sharedTodo = await todoService.shareTodo(id, targetUserId);
      if (!sharedTodo) {
        res.status(404).json({ error: 'Todo not found' });
        return;
      }

      res.status(201).json(sharedTodo);
    } catch (error: any) {
      if (error.message === 'Cannot share with yourself') {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export function getAllUsersHandler(userRepo: InMemoryUserRepository): (_req: Request, res: Response) => Promise<void> {
  return async (_req: Request, res: Response): Promise<void> => {
    try {
      const users = await userRepo.findAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export function getAllTodosHandler(todoService: TodoService): (req: Request, res: Response) => Promise<void> {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, limit, offset } = req.query;

      const limitNum = limit ? parseInt(limit as string, 10) : undefined;
      const offsetNum = offset ? parseInt(offset as string, 10) : undefined;

      let todos;

      if (userId && typeof userId === 'string') {
        // If userId query parameter is provided, get todos for that user
        todos = await todoService.getTodosByUser(userId, limitNum, offsetNum);
      } else {
        // If no userId, get all todos
        todos = await todoService.getAllTodos(limitNum, offsetNum);
      }

      res.json(todos);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}