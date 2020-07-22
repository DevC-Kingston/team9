let getHomepage = (req,res) =>{
  return res.render("home.ejs");
};

module.exports = {
  getHomepage:getHomepage
};
