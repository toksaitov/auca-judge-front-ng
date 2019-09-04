module.exports = function(params, server, database) {

    server.post([
        '/entry/:entryID/comment/create',
        '/entry/:entryID/comment/:id/update'
    ], (request, response) => {
        if (!request.session.authorized) {
            response.status(401).end('Unauthorized');

            return;
        }

        const destination = request.header('Referer') || '/entries';

        let id;
        if (!request.path.endsWith('/create')) {
            id = request.params['id'];
            if (!id) {
                request.session.errors.push('The comment is unknown.');
                response.redirect(destination);

                return;
            }
        }

        const content = request.body['content'];
        if (!content) {
            request.session.errors.push('The comment must be specified.');
            response.redirect(destination);

            return;
        }

        const userID = request.session['userID'];
        if (!userID) {
            request.session.errors.push("The comment's owner is unknown.");
            response.redirect(destination);

            return;
        }

        const entryID = request.params['entryID'];
        if (!entryID) {
            request.session.errors.push('The owning entry is not specified.');
            response.redirect(destination);

            return;
        }

        const Comment = database.comment;
        if (id) {
            Comment.update({
                'userId': userID,
                'entryId': entryID,
                'content': content
            }, {
                'where': {
                    'id': id
                }
            }).then(() => {
                response.redirect(`/entry/${entryID}`);
            }).catch(error => {
                console.error(error);

                request.session.errors.push('Failed to create a new comment.');
                response.redirect(`/entry/${entryID}`);
            });
        } else {
            Comment.create({
                'userId': userID,
                'entryId': entryID,
                'content': content
            }).then(() => {
                response.redirect(`/entry/${entryID}`);
            }).catch(error => {
                console.error(error);

                request.session.errors.push('Failed to create a new comment.');
                response.redirect(`/entry/${entryID}`);
            });
        }
    });

};

