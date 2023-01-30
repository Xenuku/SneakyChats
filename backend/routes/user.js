module.exports = (app, client) => {
    const collection = client.db('chatserver').collection('users');
    // Add user
    app.post('/api/users', (req, res) => {
        collection.findOne({username: req.body.username}).then((data) => {
            if(data) {
                res.send({ok: false, message: 'A user with this name already exists, please try again.'})
            } else {
                collection.insertOne(
                    {
                        username: req.body.username,
                        password: req.body.password,
                        email: req.body.email,
                        level: req.body.level || 'user',
                        groups: req.body.groups,
                    }
                );
                res.send({ok: true, message: "User successfully added!"});
            };
        });
    });
    // Update user profile picture
    app.put('/api/users/upload/:username', (req, res) => {
        try {
            collection.updateOne({username: req.params.username}, {$set: req.body}, {multi: true});
            res.send({ok: true, message: "Your picture has been changed!"});
        } catch (err) {
            console.log(err);
            res.send({ok: false, message: "Update failed, check server logs for more information"});
        }
    });
    // Delete user
    app.delete('/api/users/:username', (req, res) => {
        try {
            collection.deleteOne({username: req.params.username});
            res.send({"ok": true});
        } catch (err) {
            console.log(err);
            res.send({"ok": false});
        }
    });
    // Get ALL users
    app.get('/api/users', (req, res) => {
        collection.find({}).project({password: 0}).toArray(
            (err, usersArray) => {
                if(err) {
                    // Something bad went wrong
                    console.error(err);
                    res.status(404);
                } else {
                    if(usersArray.length < 1) {
                        res.status(200).send({ users: ['No users found']});
                    } else {
                        res.status(200).send({ users: usersArray});
                    }
                }
            }
        );
        
    });
    // Return ONE user
    app.get('/api/users/:username', (req, res) => {
        collection.findOne({username: req.params.username}, {projection: {password: 0}}).then(
            (user) => {
                if(!user) {
                    res.status(200).send({ user: {username: "Not found"}})
                } else {
                    res.status(200).send({ user: user});
                }
            }
        )
    });

    // Admin update
    app.put('/api/users/:username/groups', (req, res) => {
        try {
            collection.updateOne({username: req.params.username}, {$push: { groups: req.body }}, {multi: true}).then((obj) => console.log(obj));
            res.send({ok: true, message: "User's groups changed, updating.."});
        } catch (err) {
            console.log(err);
            res.send({ok: false, message: "Update failed, check server logs for more information"});
        }
    });
    // Admin update user level
    app.put('/api/users/:username/level', (req, res) => {
        try {
            collection.updateOne({username: req.params.username}, {$set: { level: req.body.level }}, {multi: true}).then((obj) => console.log(obj));
            res.send({ok: true, message: "User's level changed, updating.."});
        } catch (err) {
            console.log(err);
            res.send({ok: false, message: "Update failed, check server logs for more information"});
        }
    })
    // Self user management
    app.put('/api/user/:username', (req, res) => {
        // Look up requested username, if it exists and it's NOT current username, reject
        collection.findOne({username: req.body.username}).then((user) =>{
            // if user exists
            if (user) {
                // User is already taken
                if (user.username !== req.params.username) {
                    res.send({ok: false, message: "Sorry, this username is already in use."})
                } else if(user.username === req.params.username) { // its the same user, let the user update
                    try {
                        collection.updateOne({username: req.params.username}, {$set: req.body},{multi:true});
                        res.send({ok: true, message: "Your information has been updated!"})
                    } catch (err) {
                        console.log(err);
                        res.send({message: "Request failed, see server log for details"});
                    }
                }
            } else { // User doesn't exist, let the user take this name
                try {
                    collection.updateOne({username: req.params.username}, {$set: req.body},{multi:true});
                    res.send({ok: true, message: "Your information has been updated!"})
                } catch (err) {
                    console.log(err);
                    res.send({message: "Request failed, see server log for details"});
                }
            }
        })
    });
    // Return users if they are in a moderators group
    app.get('/api/users/group/:group', (req, res) => {
        collection.find({"groups.group": req.params.group}).toArray().then((data) => {
            if(data) {
                res.send(data);
            } else {
                console.log("No data!");
            }
        })
    });

    // Admin updating users group access
    app.put('/api/users/:username/:group', (req, res) => {
        if(req.body.query.canAccess) {
            collection.findOne({username: req.params.username, "groups.group": req.params.group}).then((data) => {
                if(data) {
                    // In group already, update
                    let groupIndex = data.groups.findIndex((group) => group.group === req.params.group);
                    data.groups[groupIndex].role = req.body.query.roleForGroup;
                    data.groups[groupIndex].channels = req.body.query.channels;
                    // If user is not currently a group admin
                    if(data.level !== 'group_admin') {
                        // and if the user is being given group admin within a group
                        if(req.body.query.roleForGroup === 'Admin') {
                            collection.updateOne({username: req.params.username}, {
                                $set: {
                                    level: "group_admin",
                                    groups: data.groups
                                }
                            }).then(() => {
                                res.send({ok: true, message: 'Successfully updated users channels and roles!'})
                            });
                        } else {
                            collection.updateOne({username: req.params.username}, {
                                $set: {
                                    groups: data.groups
                                }
                            }).then(() => {
                                res.send({ok: true, message: 'Successfully updated users channels and roles!'})
                            });
                        }
                    } else {
                        collection.updateOne({username: req.params.username}, {
                            $set: {
                                groups: data.groups
                            }
                        }).then(() => {
                            res.send({ok: true, message: 'Successfully updated users channels and roles!'})
                        });
                    }
                } else {
                    // not in group
                    // add to group
                    if(req.body.query.roleForGroup === 'Admin') {
                        collection.updateOne({username: req.params.username}, {
                            $set: { level: 'group_admin'}
                        })
                    }
                    collection.updateOne({username: req.params.username}, {
                        $addToSet : {
                            groups: {
                                group: req.body.query.group,
                                role: req.body.query.roleForGroup,
                                channels: req.body.query.channels
                            }
                        }
                    }).then(() => {
                        res.send({ok: true, message: 'Successfully added group, channels and roles to user!'});
                    })
                }
            })
        } else {
            collection.findOne({username: req.params.username, "groups.group": req.params.group}).then((data) => {
                if(data) {
                    let groupIndex = data.groups.findIndex((group) => group.group === req.params.group);
                    data.groups.splice(groupIndex, 1);
                    collection.updateOne({username: req.params.username}, {
                        $set: {
                            groups: data.groups
                        }
                    }).then(() => {
                        res.send({ok: true, message: 'Successfully removed user from group'});
                    })
                } else {
                    // user is not in group, nothing needs doing
                    // send response telling admin this
                    res.send({ok: false, message: 'User is not in this group, no update needed'});
                }
            })
        }
    });

    // Moderator updating users channel access
    app.put('/api/users/:username/:group/mod', (req, res) => {
        collection.findOne({username: req.params.username, "groups.group": req.params.group}).then((data) => {
            if(data) {
                let groupIndex = data.groups.findIndex((group) => group.group === req.params.group);
                data.groups[groupIndex].channels = req.body.channels;
                
                collection.updateOne({username: req.params.username}, {
                    $set: {
                        groups: data.groups
                    }
                }).then(() => {
                    res.send({ok: true, message: 'Successfully updated users channels!'})
                })
            } else {
                res.send({ok: false, message: 'Something went wrong, please ask an admin for more information'});
            }
        });
    });
}