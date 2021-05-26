const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const User_detail = db.user_detail;
const Company_detail = db.company_detail;
const Company = db.company;
const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

/**
 * Check taxid is exist, isn't?
 * if not, system will create new company
 * if exist, system will give permission for auto create driver
 * 
 * @returns res boolean type
 * @see 
 */
exports.checktaxid = (req, res) => {
  if (req.body.taxid) {
      Company.find(
        {
            tax_id: {$in: req.body.taxid}
        },
        (err, taxid) => {

          console.log(taxid);

          // if taxid is not exist
          if (taxid.length == 0) {

            const company = new Company({
                tax_id: req.body.taxid,
                company_name: req.body.name
            });

            company.save();

            const company_detail = new Company_detail({
                company_name: req.body.name,
                company_province: req.body.province,
                company_postal: req.body.postal,
                address: req.body.address,
            });

            company_detail.tax_id.push(company._id);
            company_detail.save();

            res.send({company_filter: true});
            //return;
          }
          else {

          res.send({company_filter: false});

          }
      })
  }
};

/**
 * Register
 * 
 * @returns boolean
 * @see 
 */
exports.signup = (req, res) => {

    const user = new User({
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, 8),
        email: req.body.email,
        //avatar: String,
    });

    const user_detail = new User_detail({
        phone: req.body.phone,
        prefix: req.body.prefix,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
    });
    user.save((err, user) => {
      if (err) {
          res.status(500).send({message: err});
          return;
      }
      Company.find(
          {
              tax_id: {$in: req.body.taxid}
          },
          (err, tax_ids) => {
              if (err) {
                  res.status(500).send({message: err});
                  return;
              }
              console.log(tax_ids.map(tax_id => tax_id._id));
              user.tax_id = tax_ids.map(tax_id => tax_id._id);

          }
      );
      Role.find(
          {
              name: {$in: req.body.roles}
          },
          (err, roles) => {
              if (err) {
                  res.status(500).send({message: err});
                  return;
              }
              user.role = roles.map(role => role._id);
              user.save(err => {
                  if (err) {
                      res.status(500).send({message: err});
                  }
              });
          }
      );
    });
    user_detail.save(err => {
        if (err) {
            res.status(500).send({message: err});
        }
        User.find(
            {
                username: {$in: req.body.username}
            },
            (err, usernames) => {
                if (err) {
                    res.status(500).send({message: err});
                    return;
                }
                user_detail.username = usernames.map(username => username._id);
                user_detail.save(err => {
                    if (err) {
                        res.status(500).send({message: err});
                    }
                });
                res.send({message: "User was registered successfully!"});
            }
        );
    });
};

/**
 * Login
 * 
 * @returns boolean 
 * @see 
 */
exports.signin = (req, res) => {
    User.findOne({
        username: req.body.username
    })
    .exec((err, user) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }

        if (!user) {
            return res.status(404).send({message: "User Not found."});
        }

        var passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );

        if (!passwordIsValid) {
            return res.status(401).send({
                accessToken: null,
                message: "Invalid Password!"
            });
        }

        var token = jwt.sign({id: user.id}, config.secret, {
            expiresIn: 86400 // 24 hours
        });
        User.findOne({
            username: req.body.username
        })
            .populate("role", "-__v")
            .exec((err, roles) => {
                res.status(200).send({
                    id: user._id,
                    username: user.username,
                    accessToken: token,
                    email: user.email,
                    role: roles.role[0].name,
                    created_at: user.createdAt,
                    updated_at: user.updatedAt
            });
        });
    });
};
