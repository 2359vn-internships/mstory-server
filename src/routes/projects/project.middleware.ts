import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const parseQueryParams = (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = querySchema.validate(req.query, { allowUnknown: true })
    if (error) return next(error)
    value.page = +value.page
    req.query = value
    next()
}

export const validateUpsertProject = (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = projectSchema.validate(req.body)
    if (error) return next(error)
    req.body = value
    next()
}

const querySchema = Joi.object({
    keyword: Joi.string()
        .allow('') // allows keyword to be undefined
        .trim() // remove leading and traling space
        .max(80),

    is_active: Joi.boolean().required(),

    view: Joi.string().valid("updated_at", "created_at").required(),

    order: Joi.string().valid("asc", "desc").required(),

    page: Joi.string()
        .empty('')
        .default('1') // set default value for page if it is undefined
        .regex(/^[0-9]+$/) // contain digits only
})

const projectSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(6)
        .max(80)
        .required(),

    description: Joi.string()
        .allow('') // can be undefined
        .max(5000)
        .required(),

    is_public: Joi.boolean().required()
})
