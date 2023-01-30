module.exports = (app, client) => {
    // On login check details and if okay, return the users data, else return error
    app.post('/api/login', (req, res) => {
        const collection = client.db('chatserver').collection('users');
        collection.find(
            {
                username: req.body.username, 
                password: req.body.password
            }).toArray(
                (err, userArr) => {
                    if(err) {
                        // Something bad went wrong
                        console.error(err);
                        res.status(404).send({'ok': false});
                    } else {
                        if(userArr.length === 1) {
                            res.status(200).send(
                                {
                                    "ok": true, 
                                    user: {
                                        username: userArr[0].username,
                                        groups: userArr[0].groups,
                                        level: userArr[0].level,
                                        profile_picture: userArr[0].profile_picture,
                                        email: userArr[0].email
                                    }
                                }
                            );
                        } else {
                            // User not found/wrong password
                            res.status(200).send({"ok": false, error: "Username or password incorrect"});
                        }
                    }
            });
    });
}