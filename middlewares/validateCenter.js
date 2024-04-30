const yup = require("yup");
const categoryModel = require("../models/category");
const centerModel = require("../models/center");

const validate = async(req, res, next) => {
    try {
        const { category , title } = req.body;
        console.log(req.originalUrl);
        if(req.originalUrl.includes("/center/add")){
            console.log("/center/add");
            const schema = yup.object().shape({
                title: yup.string().required().min(3),
                description: yup.string().required().min(100),
                longitude:yup.number().min(0),
                altitude:yup.number().min(0),
                phone:yup.number().min(10000000).max(99999999),
                location: yup.string().min(10),
                email:yup.string().email()
            });
            if(title){
                const checkIfCenterExist = await centerModel.findOne({ title });
                if (checkIfCenterExist) {
                    throw new Error("Center already exist!");
                }
            }
            await schema.validate(req.body);
        }else{
            console.log("/center/update");
            const schema = yup.object().shape({
                title: yup.string().required().min(3),
                description: yup.string().required().min(100),
                longitude:yup.number().min(0),
                altitude:yup.number().min(0),
                phone:yup.number().min(10000000).max(99999999),
                location: yup.string().min(10),
                email:yup.string().email()
            });
            const { id } = req.params;
            await schema.validate(req.body);
            var center = await centerModel.findById(id);
            if(center.title!=title){
              const checkIfCenterExist = await centerModel.find({ title });
              if (!isEmptyObject(checkIfCenterExist)) {
                throw new Error("Center already exist!");
              }
            }
        }
        
        if(category){
            const checkIfCategoryExist = await categoryModel.findById(category);
            if (isEmptyObject(checkIfCategoryExist)) {
                throw new Error("Category does not exist!");
            }
        }
    next();
   } catch (error) {
    res.json({error:error.message});
    console.log(error.message);
   }
}
module.exports = validate;