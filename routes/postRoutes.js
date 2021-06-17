const express = require('express');
const path = require("path")

const router = express.Router();

router.get("/:id", (req, res, next) => {

    var payload = {
        pageTitle: "View post",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        postId: req.params.id
    }
    
    res.status(200).render("postPage", payload);
})

router.get("/uploads/images/:path", (req, res, next) => {
    res.sendFile(path.join(__dirname, "../uploads/images/" + req.params.path));
})
module.exports = router;