let express = require("express");
let app = express();

app.use(express.static("public"));
app.get("/yeeeeeee", function (req, res) {
    res.send("I hope it's works.");
});

app.listen(8841);