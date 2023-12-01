const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
    // Create an issue with every field: POST request to /api/issues/{project}
    test("Create an issue with every field: POST request to /api/issues/{project}", function (done) {
        chai.request(server)
            .keepOpen()
            .post("/api/issues/apitest")
            .send({
                issue_title: "Title",
                issue_text: "text",
                created_by: "Functional Test - Every field filled in",
                assigned_to: "Chai and Mocha",
                status_text: "In QA",
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.issue_title, "Title");
                assert.equal(res.body.issue_text, "text");
                assert.equal(
                    res.body.created_by,
                    "Functional Test - Every field filled in"
                );
                assert.equal(res.body.assigned_to, "Chai and Mocha");
                assert.equal(res.body.status_text, "In QA");
                done();
            });
    });
    // Create an issue with only required fields: POST request to /api/issues/{project}
    test("Create an issue with only required fields: POST request to /api/issues/{project}", function (done) {
        chai.request(server)
            .keepOpen()
            .post("/api/issues/apitest")
            .send({
                issue_title: "Title",
                issue_text: "text",
                created_by: "Functional Test - Only required fields",
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.issue_title, "Title");
                assert.equal(res.body.issue_text, "text");
                assert.equal(
                    res.body.created_by,
                    "Functional Test - Only required fields"
                );
                assert.equal(res.body.assigned_to, "");
                assert.equal(res.body.status_text, "");
                done();
            });
    });
    // Create an issue with missing required fields: POST request to /api/issues/{project}
    test("Create an issue with missing required fields: POST request to /api/issues/{project}", function (done) {
        chai.request(server)
            .keepOpen()
            .post("/api/issues/apitest")
            .send({
                issue_title: "Title",
                issue_text: "text",
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, "required field(s) missing");
                done();
            });
    });
    // View issues on a project: GET request to /api/issues/{project}
    test("View issues on a project: GET request to /api/issues/{project}", function (done) {
        chai.request(server)
            .keepOpen()
            .get("/api/issues/apitest")
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                done();
            });
    });
    // View issues on a project with one filter: GET request to /api/issues/{project}
    test("View issues on a project with one filter: GET request to /api/issues/{project}", function (done) {
        chai.request(server)
            .keepOpen()
            .get("/api/issues/apitest?open=true")
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                done();
            });
    });
    // View issues on a project with multiple filters: GET request to /api/issues/{project}
    test("View issues on a project with multiple filters: GET request to /api/issues/{project}", function (done) {
        chai.request(server)
            .keepOpen()
            .get("/api/issues/apitest?open=true&issue_title=Title")
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                done();
            });
    });
    // Update one field on an issue: PUT request to /api/issues/{project}
    test("Update one field on an issue: PUT request to /api/issues/{project}", async function () {
        const requester = chai.request(server).keepOpen();
        const response = await requester.get("/api/issues/apitest");
        const randomId = response.body[0]._id;
        const res = await requester.put("/api/issues/apitest").send({
            _id: randomId,
            issue_title: "Title",
        });
        assert.equal(res.status, 200);
        assert.equal(res.body.result, "successfully updated");
    });
    // Update multiple fields on an issue: PUT request to /api/issues/{project}
    test("Update multiple fields on an issue: PUT request to /api/issues/{project}", async function () {
        const requester = chai.request(server).keepOpen();
        const response = await requester.get("/api/issues/apitest");
        const randomId = response.body[0]._id;
        const res = await chai.request(server).put("/api/issues/apitest").send({
            _id: randomId,
            issue_title: "Title",
            issue_text: "text",
        });
        assert.equal(res.status, 200);
        assert.equal(res.body.result, "successfully updated");
    });
    // Update an issue with missing _id: PUT request to /api/issues/{project}
    test("Update an issue with missing _id: PUT request to /api/issues/{project}", function (done) {
        chai.request(server)
            .keepOpen()
            .put("/api/issues/apitest")
            .send({
                issue_title: "Title",
                issue_text: "text",
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, "missing _id");
                done();
            });
    });
    // Update an issue with no fields to update: PUT request to /api/issues/{project}
    test("Update an issue with no fields to update: PUT request to /api/issues/{project}", function (done) {
        chai.request(server)
            .keepOpen()
            .put("/api/issues/apitest")
            .send({
                _id: "656a5342d4fa0d26840c7858",
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, "no update field(s) sent");
                done();
            });
    });
    // Update an issue with an invalid _id: PUT request to /api/issues/{project}
    test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", function (done) {
        chai.request(server)
            .keepOpen()
            .put("/api/issues/apitest")
            .send({
                _id: "656a5342d4fa0d26840c7858",
                issue_title: "Title",
                issue_text: "text",
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, "could not update");
                done();
            });
    });
    // Delete an issue: DELETE request to /api/issues/{project}
    test("Delete an issue: DELETE request to /api/issues/{project}", async function () {
        const requester = chai.request(server).keepOpen();
        const response = await requester.get("/api/issues/apitest");
        const randomId = response.body[0]._id;
        const res = await chai
            .request(server)
            .delete("/api/issues/apitest")
            .send({
                _id: randomId,
            });
        assert.equal(res.status, 200);
        assert.equal(res.body.result, "successfully deleted");
    });
    // Delete an issue with an invalid _id: DELETE request to /api/issues/{project}
    test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", function (done) {
        chai.request(server)
            .keepOpen()
            .delete("/api/issues/apitest")
            .send({
                _id: "invalid_id",
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, "could not delete");
                done();
            });
    });
    // Delete an issue with missing _id: DELETE request to /api/issues/{project}
    test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", function (done) {
        chai.request(server)
            .keepOpen()
            .delete("/api/issues/apitest")
            .send({})
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.error, "missing _id");
                done();
            });
    });
});
