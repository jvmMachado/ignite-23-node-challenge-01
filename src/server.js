import http from 'node:http';
import { json } from './middlewares/json.js';
import { routes } from './routes.js';
import { extractQueryParams } from './utils/extract-query-params.js';
import * as fs from 'node:fs';
import { parse  } from 'csv-parse';

const server = http.createServer(async (request, response) => {
  const { url, method } = request;

  await json(request, response);

  const route = routes.find(route => route.method === method && route.path.test(url));

  if (route) {
    const routeParams = request.url.match(route.path);

    const { query, ...params } = routeParams.groups;

    request.params = params;
    request.query = query ? extractQueryParams(query) : {};

    return route.handler(request, response);
  }

  return response.writeHead(404).end();
});

server.once('listening', () => {
  fs.createReadStream("./tasks.csv")
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", function (row) {
      const [ title, description ] = row;

      fetch('http://localhost:3333/tasks', {
        method: 'POST',
        body: JSON.stringify({ title, description }),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(response => response.text()
      ).then(data => console.log(data));
    })
    .on("end", function () {
      console.log("finished parsing csv");
    })
    .on("error", function (error) {
      console.log(error.message);
    });
});

server.listen(3333);