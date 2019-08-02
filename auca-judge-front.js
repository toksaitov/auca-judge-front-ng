const params =
    require('./lib/params.js');
const database =
    require('./lib/database.js')(params);
const server =
    require('./lib/server.js')(params);

require('./lib/login.js')(params, server, database);
require('./lib/user.js')(params, server, database);
require('./lib/entry.js')(params, server, database);
require('./lib/comment.js')(params, server, database);

database.start().then(() => {
    server.listen(params.serverPort, () => {
        console.log(`The server is listening on port '${params.serverPort}'.`);
    });
});

