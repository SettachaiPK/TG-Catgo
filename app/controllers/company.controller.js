const db = require("../models");
const Company = db.company;
const CompanyDetail = db.company_detail;
const updateableDetail = [
    "company_name",
    "user_id",
    "address",
    "company_province",
    "company_postal"
]

exports.allCompany = (req, res) => {
    CompanyDetail.find({}).exec((err, company) => {
            console.log(company)
            if (err) {
                return res.status(500).send({ message: err });
            }
            if (company.length == 0) {
                return res.status(404).send({ message: "Company Not found." });
            }
            return res.status(200).send({
                message: company.length + " Companies found.",
                data: company
            });
        });
};

exports.getCompany = (req, res) => {
    console.log(req.params);
    CompanyDetail.find({
        tax_id: {$in: req.params.taxid}
    }).exec((err, company) => {
        console.log(company)
        if (company.length == 0) {
            return res.status(404).send({ message: "Company Not found." });
        }
        return res.status(200).send({
            message: "Company found.",
            data: company
        });
    });
};

exports.getUserCompany = (req, res) => {
    console.log(req.params);
    CompanyDetail.find({
        tax_id: {$in: req.params.taxid}
    }).exec((err, company) => {
        console.log(company)
        if (company.length == 0) {
            return res.status(404).send({ message: "Company Not found." });
        }
        return res.status(200).send({
            message: "Company found.",
            data: company
        });
    });
};

exports.createCompany = (req, res) => {
    console.log(req.query);
    const company = new Company({
        company_name: req.query.name,
        tax_id: req.query.tax_id
    });
    const company_detail = new CompanyDetail({
        company_name: req.query.name,
        user_id: req.query.user_id,
        address: req.query.address,
        tax_id: req.query.tax_id,
        company_province: req.query.province,
        company_postal: req.query.postal
    });
    CompanyDetail.find(
        {
            tax_id: {$in: req.query.tax_id}
        },
        (err, tax_id) => {

        console.log(typeof(tax_id));
            if (tax_id.length == 0) {
                company_detail.save(err => {
                    if (err) {
                        res.status(500).send({message: err});
                        return;
                    }
                });
                company.save(err => {
                    if (err) {
                        res.status(500).send({message: err});
                    }
                });
                res.status(201).send({
                    message: "Company Created.",
                    name: company.company_name,
                    tax_id: company.tax_id
                });
            }
            else {
                res.status(400).send({message: "Company already registered."});
            }
        })
}

exports.updateCompany = (req, res) => {
    console.log(req.query);
    for (const key in req.query){
        if(!updateableDetail.includes(key)){
            delete req.query[key]
          }
    }
    const data = {
        $set: req.query
      }
    const id = {'tax_id': req.params.taxid};
    console.log(id);
    console.log(data);
    CompanyDetail.findOneAndUpdate(id, data, function(err) {
        if (err) return res.send(500, {error: err});
        return res.status(201).send('Company Updated.');
    });
};