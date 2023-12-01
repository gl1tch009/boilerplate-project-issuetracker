"use strict";

const { ObjectId } = require("mongodb");

module.exports = function (app, db) {
    app.route("/api/issues/:project")

        .get(function (req, res, next) {
            let project = req.params.project;
            const {
                _id,
                issue_title,
                issue_text,
                created_by,
                assigned_to,
                status_text,
                open,
            } = req.query;
            db.findOne({ project_name: project }, (err, data) => {
                if (err) return res.json({ error: "could not get" });
                let issues = data?.issues || [];
                if (_id)
                    issues = issues.filter((issue) => issue._id.equals(_id));
                if (issue_title)
                    issues = issues.filter(
                        (issue) => issue.issue_title === issue_title
                    );
                if (issue_text)
                    issues = issues.filter(
                        (issue) => issue.issue_text === issue_text
                    );
                if (created_by)
                    issues = issues.filter(
                        (issue) => issue.created_by === created_by
                    );
                if (assigned_to)
                    issues = issues.filter(
                        (issue) => issue.assigned_to === assigned_to
                    );
                if (status_text)
                    issues = issues.filter(
                        (issue) => issue.status_text === status_text
                    );
                if (open)
                    issues = issues.filter((issue) => issue.open === open);
                res.json(issues);
            });
        })

        .post(function (req, res) {
            let project = req.params.project;
            const {
                issue_title,
                issue_text,
                created_by,
                assigned_to,
                status_text,
            } = req.body;
            if (!issue_title || !issue_text || !created_by)
                return res.json({ error: "required field(s) missing" });
            const newIssue = {
                _id: new ObjectId(),
                issue_title,
                issue_text,
                created_by,
                assigned_to: assigned_to || "",
                status_text: status_text || "",
                created_on: new Date().toISOString(),
                updated_on: new Date().toISOString(),
                open: true,
            };
            db.findOne({ project_name: project }, (err, data) => {
                if (err)
                    return res.json({ error: "could not create", issue_title });
                if (!data)
                    return res.json({ error: "could not create", issue_title });
                const issues = data.issues || [];
                issues.push(newIssue);
                db.findOneAndUpdate(
                    { project_name: project },
                    { $set: { issues: issues } },
                    { returnOriginal: false },
                    (err, data) => {
                        if (err)
                            return res.json({
                                error: "could not create",
                                issue_title,
                            });
                        res.json(newIssue);
                    }
                );
            });
        })

        .put(function (req, res) {
            let project = req.params.project;
            const {
                _id,
                issue_title,
                issue_text,
                created_by,
                assigned_to,
                status_text,
                open,
            } = req.body;
            if (!_id) return res.json({ error: "missing _id" });
            if (
                !issue_title &&
                !issue_text &&
                !created_by &&
                !assigned_to &&
                !status_text &&
                !open
            )
                return res.json({ error: "no update field(s) sent", _id: _id });
            db.findOne({ project_name: project }, (err, data) => {
                if (err)
                    return res.json({ error: "could not update", _id: _id });
                if (!data)
                    return res.json({ error: "could not update", _id: _id });
                const issues = data.issues;
                const index = issues.findIndex((issue) =>
                    issue._id.equals(_id)
                );
                if (index === -1)
                    return res.json({ error: "could not update", _id: _id });
                const issue = issues[index];
                if (issue_title) issue.issue_title = issue_title;
                if (issue_text) issue.issue_text = issue_text;
                if (created_by) issue.created_by = created_by;
                if (assigned_to) issue.assigned_to = assigned_to;
                if (status_text) issue.status_text = status_text;
                if (open) issue.open = open;
                issue.updated_on = new Date().toISOString();
                db.findOneAndUpdate(
                    { project_name: project },
                    { $set: { issues: issues } },
                    { returnOriginal: false },
                    (err, data) => {
                        if (err)
                            return res.json({
                                error: "could not update",
                                _id: _id,
                            });
                        res.json({ result: "successfully updated", _id: _id });
                    }
                );
            });
        })

        .delete(function (req, res) {
            let project = req.params.project;
            const _id = req.body._id;
            if (!_id) return res.json({ error: "missing _id" });
            db.findOne({ project_name: project }, (err, data) => {
                if (err)
                    return res.json({ error: "could not delete", _id: _id });
                const issues = data.issues;
                const index = issues.findIndex((issue) =>
                    issue._id.equals(_id)
                );
                if (index === -1)
                    return res.json({ error: "could not delete", _id: _id });
                issues.splice(index, 1);
                db.findOneAndUpdate(
                    { project_name: project },
                    { $set: { issues: issues } },
                    { returnOriginal: false },
                    (err, data) => {
                        if (err)
                            return res.json({
                                error: "could not delete",
                                _id: _id,
                            });
                        res.json({ result: "successfully deleted", _id: _id });
                    }
                );
            });
        });
};
