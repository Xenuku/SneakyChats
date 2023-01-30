module.exports = (app, client) => {
    const collection = client.db('chatserver').collection('groups');
    // Groups
    // Get all groups
    app.get('/api/groups', (req, res) => {
        collection.find({}).toArray(
            (err, groupsArray) => {
                if(err) {
                    // Something bad went wrong
                    console.error(err);
                    res.status(404);
                } else {
                    if(groupsArray.length < 1) {
                        res.status(200).send({ groups: ['No groups found']});
                    } else {
                        res.status(200).send({ groups: groupsArray});
                    }
                }
            }
        );
    });
    // Add a group
    app.post('/api/groups', (req, res) => {
        collection.findOne({group: req.body.group}).then((result) => {
            if(result) {
                res.send({ok: false, message: "A group with this name already exists, try a different name"});
            } else {
                collection.insertOne({
                    group: req.body.group,
                    channels: req.body.channels
                });
                res.send({ok: true, message: "Group added... updating!"});
            }
        });
    });
    // List a single group
    app.get('/api/groups/:group', (req, res) => {
        collection.findOne({group: req.params.group}).then(
            (group) => {
                if(!group) {
                    res.status(200).send({ group: []});
                } else {
                    res.status(200).send({ group: group});
                }
            }
        );
    });
    // Delete a group
    app.delete('/api/groups/:group', (req, res) => {
        try {
            // Delete from the groups collection, history DB and users data
            collection.deleteOne({group: req.params.group}).then(() => {
                client.db('chatserver').collection('users').find({"groups.group": req.params.group}).toArray().then((result) => {
                    result.forEach((user) => {
                        let groupIndex = user.groups.findIndex((group) => group.group === req.params.group)
                        user.groups.splice(groupIndex, 1);
                        client.db('chatserver').collection('users').updateOne({username: user.username}, {
                            $set: {
                                groups: user.groups
                            }
                        })
                    });
                });
                res.send({ok: true, message: "Group deleted, updating.."});
            });
            client.db('history').collection(req.params.group).drop();
           
        } catch (err) {
            console.log(err);
            res.send({ok: false, message: "Something went wrong, check server terminal for details"});
        }
    });
    // Get message counts for all groups
    app.get('/api/messageCount', (req, res) => {
        let count = 0;
        client.db('history').listCollections().toArray((err, collections) => {
            collections.forEach(collection => {
                client.db('history').collection(collection.name).count().then((data) => {
                    count += data;
                });
            });
        });
        setTimeout(() => {
            res.send({count: count});
        }, 500);       
    });
}