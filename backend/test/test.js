let assert = require('assert');
let server = require('../server.js');
let chai = require('chai');
let should = chai.should();
let expect = chai.expect;
let chaiHttp = require('chai-http');
chai.use(chaiHttp)




describe('User Route tests', () => {
    describe('/api/users', () => {
        it('Should get all users', (done) => {
            chai.request(server)
            .get('/api/users')
            .end((err, res) => {
                res.body.should.be.a('object');
                res.body.should.have.property('users');
                done();
            })
        });
    });

    describe('/api/users/Liam', () => {
        it('Should get user Liam without password', (done) => {
            chai.request(server)
            .get('/api/users/Liam')
            .end((err, res) => {
                res.body.should.be.a('object');
                expect(res.body.user).to.have.property('username', "Liam");
                expect(res.body.user).to.not.have.property('password');
                done();
            })
        });
    });

    describe('/api/users', () => {
        it('Should add a user', (done) => {
            chai.request(server)
            .post('/api/users')
            .set('content-type', 'application/json')
            .send({
                username: 'MochaTest',
                password: '1234',
                email: 'mocha@test.com',
                level: 'user',
                groups: []
            })
            .end((err, res) => {
                res.body.should.have.property('ok', true);
                res.body.should.have.property('message', "User successfully added!");
                done();
            })
        });
    });

    describe('/api/user/:username', () => {
        it('Should update the newly created user', (done) => {
            chai.request(server)
            .put('/api/user/MochaTest')
            .set('content-type', 'application/json')
            .send({
                username: 'MochaTest2',
                email: 'mochachanged@test.com',
            })
            .end((err, res) => {
                res.body.should.have.property('ok', true);
                res.body.should.have.property('message', "Your information has been updated!");
                done();
            })
        });
    });

    describe('/api/users', () => {
        it('Should delete the newly created and updated user', (done) => {
            chai.request(server)
            .delete('/api/users/MochaTest2')
            .end((err, res) => {
                res.body.should.have.property('ok', true);
                done();
            })
        });
    });
});


describe('Login Route Test', () => {
    describe('/api/login', () => {
        it('Should login without errors', (done) => {
            chai.request(server)
            .post('/api/login')
            .set('content-type', 'application/json')
            .send({
                username: 'Liam',
                password: '1234'
            })
            .end((err, res) => {
                res.body.should.have.property('ok', true);
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            })
        });
    });
});

describe('Group & Channel Route Tests', () => {
    describe('/api/groups', () => {
        it('Should get all groups', (done) => {
            chai.request(server)
            .get('/api/groups')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.groups[0].should.have.property('group', 'Programmers');
                res.body.groups[1].should.have.property('group', 'Hobby');
                done();
            })
        });
    });

    describe('/api/groups', () => {
        it('Should add a test group', (done) => {
            chai.request(server)
            .post('/api/groups')
            .set('content-type', 'application/json')
            .send({
                group: 'MochaTest',
                channels: ['test', 'test2']
            })
            .end((err, res) => {
                res.body.should.have.property('ok', true);
                res.body.should.have.property('message', "Group added... updating!");
                done();
            })
        });
    });

    describe('/api/channels/:group', () => {
        it('Should get all the channels of new test group', (done) => {
            chai.request(server)
            .get('/api/channels/MochaTest')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('channels');
                res.body.channels.should.be.a('array');
                done();
            })
        });
    });

    describe('/api/channels/:group', () => {
        it('Should update the channels in the test group', (done) => {
            chai.request(server)
            .put('/api/channels/MochaTest')
            .set('content-type', 'application/json')
            .send({
                channels: ['test4', 'test2']
            })
            .end((err, res) => {
                res.body.should.have.property('ok', true);
                res.body.should.have.property('message', "Successfully updated group!");
                done();
            })
        });
    });

    describe('/api/groups/:name', () => {
        it('Should get just the test group', (done) => {
            chai.request(server)
            .get('/api/groups/MochaTest')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.group.should.have.property('group', 'MochaTest');
                res.body.should.be.a('object');
                done();
            })
        });
    });

    describe('/api/groups/:name', () => {
        it('Should delete the new test group', (done) => {
            chai.request(server)
            .delete('/api/groups/MochaTest')
            .end((err, res) => {
                res.body.should.have.property('ok', true);
                res.body.should.have.property('message', "Group deleted, updating..");
                done();
            })
        });
    });
});