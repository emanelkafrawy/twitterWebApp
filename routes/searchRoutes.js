const express = require('express');

const router = express.Router();

router.get("/", (req, res, next) => {
    var payload = getPayload(req.session.user);

    res.status(200).render("searchPage", payload);
})

router.get("/:selectedTab", (req, res, next) => {
    var payload = getPayload(req.session.user);

    payload.selectedTab = req.params.selectedTab    
    res.status(200).render("searchPage", payload);
})

function getPayload(userLoggedIn){  
    return {
        pageTitle: "Search",
        userLoggedIn: userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn)
    }
}
module.exports = router;