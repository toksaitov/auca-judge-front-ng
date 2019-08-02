const path =
    require('path');
const spawn =
    require("child_process").spawn;
const marked =
    require('marked');
const short =
    require('short-uuid');
const translator =
    short();

module.exports = function(params, server, database) {

    server.get(['/', '/entries', '/entries/page/:number'], (request, response) => {
        const entriesPerPage =
            100;
        const page =
            Math.max((request.params['number'] || 0) - 1, 0);

        const Entry = database.entry;
        Entry.findAndCount({
            'offset': page * entriesPerPage,
            'limit': entriesPerPage,
            order: [
                [ 'createdAt', 'ASC' ]
            ],
        }).then(result => {
            response.render('entry/entries', {
                'session': request.session,
                'entries': result.rows,
                'page': page + 1,
                'lastPage': Math.ceil(result.count / entriesPerPage),
                'totalEntries': result.count,
                'entriesPerPage': entriesPerPage
            });
        }).catch(error => {
            console.error(error);

            response.status(500).end('Internal Server Error');
        });
    });

    server.get(['/entry/create', '/entry/:id/update'], (request, response) => {
        if (!request.session.authorized) {
            response.status(401).end('Unauthorized');

            return;
        }

        const previousLocation =
            request.header('Referer') || '/entries';

        if (request.path === '/entry/create') {
            response.render('entry/entry-create-update', {
                'session': request.session,
                'entry': null
            });
        } else {
            id = request.params['id'];
            if (!id) {
                request.session.errors.push('The entry is unknown.');
                response.redirect(previousLocation);

                return;
            }

            const Entry = database.entry;
            Entry.findById(id).then(entry => {
                response.render('entry/entry-create-update', {
                    'session': request.session,
                    'entry': entry
                });
            }).catch(error => {
                console.error(error);

                request.session.errors.push('Failed to find the specified entry.');
                response.redirect(previousLocation);
            });
        }
    });

    server.post(['/entry/create', '/entry/:id/update'], (request, response) => {
        if (!request.session.authorized) {
            response.status(401).end('Unauthorized');

            return;
        }

        if (!request.session.administrator) {
            response.status(403).end('Forbidden');

            return;
        }

        const destination =
            request.header('Referer') || '/entries';

        let id;
        if (!request.path.endsWith('/create')) {
            id = request.params['id'];
            if (!id) {
                request.session.errors.push('The entry is unknown.');
                response.redirect(destination);

                return;
            }
        }

        const title = request.body['title'];
        if (!title) {
            request.session.errors.push('The entry title must be specified.');
        }

        let content = request.body['content'];
        if (!content) {
            request.session.errors.push('The entry content must be specified.');
        }

        const published =
            request.body['published'];

        if (request.session.errors.length > 0) {
            response.redirect(destination);

            return;
        }

        const Entry = database.entry;
        if (id) {
            Entry.update({
                'title': title,
                'content': content,
                'published': published
            }, {
                'where': {
                    'id': id
                }
            }).then(result => {
                response.redirect(`/entry/${id}`);
            }).catch(error => {
                console.error(error);

                request.session.errors.push('Failed to create a new entry.');
                response.redirect(`/entry/${id}`);
            });
        } else {
            Entry.create({
                'title': title,
                'content': content,
                'published': published
            }).then(entry => {
                response.redirect(`/entry/${entry.id}`);
            }).catch(error => {
                console.error(error);

                request.session.errors.push('Failed to create a new entry.');
                response.redirect(destination);
            });
        }
    });

    server.post('/entry/:id/delete', (request, response) => {
        if (!request.session.authorized) {
            response.status(401).end('Unauthorized');

            return;
        }

        if (!request.session.administrator) {
            response.status(403).end('Forbidden');

            return;
        }

        const previousLocation =
            request.header('Referer') || '/entries';

        const id = request.params['id'];
        if (!id) {
            request.session.errors.push('The entry is unknown.');
            response.redirect(previousLocation);

            return;
        }

        const Entry = database.entry;
        Entry.destroy({
            'where': {
                'id': id
            }
        }).then(() => {
            response.redirect('/entries');
        }).catch(error => {
            console.error(error);

            request.session.errors.push('Failed to remove the entry.');
            response.redirect('/entries');
        });
    });

    server.get('/entry/:id', (request, response) => {
        const previousLocation = request.header('Referer') || '/entries';

        const id = request.params['id'];
        if (!id) {
            request.session.errors.push('The entry is unknown.');
            response.redirect(previousLocation);

            return;
        }

        const Entry   = database.entry;
        const Comment = database.comment;
        const User    = database.user;
        Entry.findById(id, {
            'include': [ {
                'model': Comment,
                'include': [ User ]
            } ]
        }).then(entry => {
            let content = entry.content;
            entry.content = marked(content);
            response.render('entry/entry', {
                'session': request.session,
                'entry': entry,
                'comment': null
            });
        }).catch(error => {
            console.error(error);

            request.session.errors.push('The entry was not found.');
            response.redirect(previousLocation);
        });
    });

};

