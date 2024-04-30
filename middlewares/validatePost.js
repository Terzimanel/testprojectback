const yup = require("yup");
const validate = async(req, res, next) => {
   try {
    console.log(req.body);
    const schema = yup.object().shape({

        title: yup.string().required(),
        description: yup.string().required(),
        short_description: yup.string().required(),
        
        
    });
    await schema.validate(req.body);
    next();
   } catch (error) {
    res.json(error.message);
    console.log(error.message);

   }
}
module.exports = validate;