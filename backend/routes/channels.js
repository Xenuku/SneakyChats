module.exports = (app, client) => {
    const collection = client.db('chatserver').collection('groups');
    // Get all channels for a single group
    app.get('/api/channels/:group', (req, res) => {
        collection.findOne({group: req.params.group}).then(
            (group) => {
                if(!group) {
                    res.status(200).send({ channels: []});
                } else {
                    res.status(200).send({ channels: group.channels});
                }
            }
        );
    });
    // Update channels for a group if a mod
    app.put('/api/channels/:group/mod', (req, res) => {
        try {
            collection.updateOne({group: req.params.group}, {
                $push: { channels: req.body.channel }
            }).then(() => {
                res.send({ok: true, message: "Successfully added channel to group"})
            })
        } catch (err) {
            console.log(err);
            res.send({ok: false, message: "Channel add failed, please ask an admin for more information"});
        }
    });
    // Update channels for a group if an admin/superadmin
    app.put('/api/channels/:group', (req, res) => {
        try {
            collection.updateOne({group: req.params.group}, {
                $set: {channels: req.body.channels}
            }, {multi: true});
            res.send({ok: true, message: "Successfully updated group!"});
        } catch (err) {
            console.log(err);
            res.send({ok: false, message: "Update failed, check server logs for more information"});
        }
    });
}