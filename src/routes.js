import { randomUUID } from 'node:crypto';
import { Database } from './database.js';
import { buildRoutePath } from './utils/build-route-path.js';

const database = new Database();

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (request, response) => {
      const { search } = request.query;

      const tasks = database.select('tasks', { title: search, description: search });

      return response.end(JSON.stringify(tasks));
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (request, response) => {
      try {
        const { title, description } = request.body;
        const newTask = {
          id: randomUUID(),
          title: title,
          description: description,
          completed_at: null,
          created_at: Date.now(),
          updated_at: Date.now(),
        }

        database.insert('tasks', newTask);

        return response.writeHead(201).end();
      } catch {
        response.writeHead(500).end();
      }
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      const { id } = request.params;
      const { title, description } = request.body;

      try {
        database.update('tasks', id, {
          title,
          description,
          updated_at: Date.now(),
        });
      } catch (err) {
        return response.writeHead(500).end(err);
      }

      return response.writeHead(204).end();
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      const { id } = request.params;

      database.delete('tasks', id);

      return response.writeHead(204).end();
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (request, response) => {
      const { id } = request.params;

      try {
        database.update('tasks', id, { completed_at: Date.now(), updated_at: Date.now() });
      } catch (err) {
        return response.writeHead(500).end(err);
      }

      return response.writeHead(204).end();
    }
  },
];