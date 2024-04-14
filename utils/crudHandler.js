const Errorhandler = require("./errorHandler");

class crudHandler extends Errorhandler {
    async getAll(req, res, next, Model) {
        try {
            const products = await Model.find();
            res.status(200).json({
                success: true,
                count: products.length,
                products,
            });
        } catch (error) {
            next(new Errorhandler(`Sorry We Have a ${error} In The Above Request`, 404));
        }
    }

    async newItem(req, res, next, Model) {
        try {
            req.body.user = req.user.id;
            const product = await Model.create(req.body);
            res.status(201).json({
                success: true,
                data: product?._id,
            });
        } catch (error) {
            next(new Errorhandler(`Sorry We Have a ${error} In The Above Request`, 404));
        }
    }

    async getSingle(req, res, next, Model) {
        try {
            const product = await Model.findById(req.params.id);
            if (!product) {
                return next(new Errorhandler('Product not found in the database', 400));
            }
            res.status(201).json({
                success: true,
                product,
            });
        } catch (error) {
            next(new Errorhandler(`Sorry We Have a ${error} In The Above Request`, 404));
        }
    }

    async updateItem(req, res, next, Model,Body) {
        try {
            let product = await Model.findById(req.params.id);
            if (!product) {
                return next(new Errorhandler('Product not found in the database', 400));
            }
            product = await Model.findByIdAndUpdate(req.params.id, Body, {
                new: true,
                runValidators: true,
            });
            res.status(200).json({
                success: true,
                product,
            });
        } catch (error) {
            next(new Errorhandler(`Sorry We Have a ${error} In The Above Request`, 404));
        }
    }

    async deleteItem(req, res, next, Model) {
        try {
            const product = await Model.findById(req.params.id);
            if (!product) {
                return next(new Errorhandler('Product not found in the database', 400));
            }
            await product.deleteOne();
            res.status(200).json({
                success: true,
                message: "Product deleted",
            });
        } catch (error) {
            next(new Errorhandler(`Sorry We Have a ${error} In The Above Request`,404));
        }
    }
}

module.exports = new crudHandler();
