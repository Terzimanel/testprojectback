const yup = require("yup");
const categoryModel = require("../models/category");

const validate = async(req, res, next) => {

   try {
    
    const { parent , title } = req.body;

    if(req.originalUrl.includes("/category/add")){
        console.log("/category/add");
        const schema = yup.object().shape({
            title: yup.string().required().min(3),
            description: yup.string().required().min(100),
        });
        const checkIfCategoryExist = await categoryModel.findOne({ title });
        if (!isEmptyObject(checkIfCategoryExist)) {
            throw new Error("Category already exist!");
        }
        await schema.validate(req.body);
    }else{
        console.log("/category/update");
        const { id } = req.params;
        var category = await categoryModel.findById(id);
        if (category.title != title) {
            const checkIfCategoryExist = await categoryModel.find({ title });
            if (!isEmptyObject(checkIfCategoryExist)) {
                throw new Error("Category already exist!");
            }
        }
    }

    if(parent && parent.length>1){
        const checkIfCategoryParentExist = await categoryModel.findById(parent);
        if (isEmptyObject(checkIfCategoryParentExist)) {
            throw new Error("Category parent does not exist!");
        }
    }
    
    
    next();
   } catch (error) {
    res.json({error:error.message});
    console.log(error.message);

   }
}
module.exports = validate;