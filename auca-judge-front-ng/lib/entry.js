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
const mongoose =
    require("mongoose");

module.exports = function(params, server, database) {
    
    function saveProblem(tests, onFinishCallback) {
        let problemData = JSON.parse(tests);

        problemData["_id"] = new mongoose.Types.ObjectId(problemData["_id"]["$oid"]);
        let Problem = database.Problem;
        let problem = new Problem(problemData);
        problem.save(error => {
            if (error) {
                console.error(error);
                throw error;
            }

            // Temp
            console.log('A new problem was saved.');

            onFinishCallback();
        });
    }

    server.get(['/', '/entries', '/entries/page/:number'], (request, response) => {
        const entriesPerPage =
            100;
        const page =
            Math.max((request.params['number'] || 0) - 1, 0);

        const Entry = database.entry;
        const User = database.user;
        Entry.findAndCount({
            'offset': page * entriesPerPage,
            'limit': entriesPerPage,
            'order': [
                [ 'createdAt', 'ASC' ]
            ],
            'include': [ User ]
        }).then(result => {
            response.format({
                'text/html': () => {
                    response.render('entry/entries', {
                        'session': request.session,
                        'entries': result.rows,
                        'page': page + 1,
                        'lastPage': Math.ceil(result.count / entriesPerPage),
                        'totalEntries': result.count,
                        'entriesPerPage': entriesPerPage
                    });
                },
                'application/json': () => {
                    response.json({
                        'articles': result.rows.map(entry => {
                            return {
                                'id': entry.id,
                                'title': entry.title,
                                'body': entry.content,
                                'description': entry.content,
                                'favorited': false,
                                'favoritesCount': 1,
                                'language': entry.language,
                                'createdAt': entry.createdAt,
                                'updatedAt': entry.updatedAt,
                                'slug': null,
                                'author': {
                                    'username': entry.user.login,
                                    'bio': null,
                                    'image': null,
                                    'following': false
                                }
                            };
                        }),
                        'articlesCount': result.count
                    });
                }
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
                response.format({
                    'text/html': () => {
                        response.render('entry/entry-create-update', {
                            'session': request.session,
                            'entry': entry
                        });
                    },
                    'application/json': () => {
                        response.json({
                            'id': entry.id,
                            'title': entry.title,
                            'content': entry.content,
                            'language': entry.language,
                            'tests': entry.tests,
                            'published': entry.published,
                            'createdAt': entry.createdAt
                        });
                    }
                });
            }).catch(error => {
                console.error(error);

                request.session.errors.push('Failed to find the specified entry.');
                response.redirect(previousLocation);
            });
        }
    });

    server.post(['/entry/create', '/entry/:id/update'], server.authOptional, (request, response) => {
        if (!(request.headers['accept'].includes('text/html') && request.session.authorized ||
              request.headers['accept'].includes('application/json') && request.payload.authorized)) {
            response.status(401).end('Unauthorized');

            return;
        }

        if (!(request.headers['accept'].includes('text/html') && request.session.administrator ||
              request.headers['accept'].includes('application/json') && request.payload.administrator)) {
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

        let language = request.body['language'];
        if (!language) {
            request.session.errors.push('The entry language must be specified.');
        }

        let tests = request.body['tests'];
        if (!tests) {
            request.session.errors.push('The entry tests must be specified.');
        }

        const published =
            request.body['published'];

        console.log(request.session.errors);
        if (request.session.errors.length > 0) {
            response.redirect(destination);

            return;
        }

        const Entry = database.entry;
        if (id) {
            Entry.update({
                'title': title,
                'content': content,
                'language': language,
                'tests': tests,
                'published': published
            }, {
                'where': {
                    'id': id
                }
            }).then(result => {
                saveProblem(tests, () => {
                    response.redirect(`/entry/${id}`);
                });
            }).catch(error => {
                console.error(error);

                request.session.errors.push('Failed to create a new entry.');
                response.redirect(`/entry/${id}`);
            });
        } else {
            Entry.create({
                'title': title,
                'content': content,
                'language': language,
                'tests': tests,
                'published': published,
                'userId': request.session.userID || request.payload.userID
            }).then(entry => {
                saveProblem(tests, () => {
                    response.format({
                        'text/html': () => {
                            response.redirect(`/entry/${entry.id}`);
                        },
                        'application/json': () => {
                            response.json({
                                'article': {
                                    'id': entry.id,
                                    'title': entry.title,
                                    'body': entry.content,
                                    'description': entry.content,
                                    'favorited': false,
                                    'favoritesCount': 1,
                                    'language': entry.language,
                                    'createdAt': entry.createdAt,
                                    'updatedAt': entry.updatedAt,
                                    'slug': null,
                                    'author': {
                                        'username': 'administrator',
                                        'bio': null,
                                        'image': null,
                                        'following': false
                                    }
                                }
                            });
                        }
                    });
                });
            }).catch(error => {
                console.error(error);

                request.session.errors.push('Failed to create a new entry.');
                response.redirect(destination);
            });
        }
    });

    server.delete('/entry/:id/delete', server.authOptional, (request, response) => {
        if (!(request.headers['accept'].includes('text/html') && request.session.authorized ||
              request.headers['accept'].includes('application/json') && request.payload.authorized)) {
            response.status(401).end('Unauthorized');

            return;
        }

        if (!(request.headers['accept'].includes('text/html') && request.session.administrator ||
              request.headers['accept'].includes('application/json') && request.payload.administrator)) {
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
                'id': ''
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
            }]
        }).then(entry => {
            response.format({
                'text/html': () => {
                    entry.content = marked(entry.content);
                    response.render('entry/entry', {
                        'session': request.session,
                        'entry': entry,
                        'comment': null
                    });
                },
                'application/json': () => {
                    response.json({
                        'article': {
                            'id': entry.id,
                            'title': entry.title,
                            'body': entry.content,
                            'description': entry.content,
                            'language': entry.language,
                            'favorited': false,
                            'favoritesCount': 1,
                            'createdAt': entry.createdAt,
                            'updatedAt': entry.updatedAt,
                            'slug': null,
                            'author': {
                                'username': 'administrator',
                                'bio': null,
                                'image': null,
                                'following': false
                            }
                        }
                    });
                }
            });
        }).catch(error => {
            console.error(error);

            request.session.errors.push('The entry was not found.');
            response.redirect(previousLocation);
        });
    });

    // TODO: Temporary

    server.get('/entry/:id/comments', (request, response) => {
        response.format({
            'application/json': () => {
                response.json({
                    comments: []
                });
            }
        });
    });

};

