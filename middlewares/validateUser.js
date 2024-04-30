const yup = require("yup");
const validateUser = async(req, res, next) => {
   try {
    console.log(req.body);
    const schema = yup.object().shape({

    firstname: yup.string().required(),
    lastname: yup.string().required(),
    phone: yup.number().min(10000000).max(99999999),
    email:yup.string().email(),
    password:yup.string(),

    });
    await schema.validate(req.body);
    next();
   } catch (error) {
    res.json(error.message);
    console.log(error.message);

   }
}
module.exports = validateUser;