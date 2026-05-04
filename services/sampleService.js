const SampleModel = require('../models/sampleModel');

const getAll = () => SampleModel.find();

const getById = (id) => SampleModel.findById(id);

const create = (data) => SampleModel.create(data);

const update = (id, data) => SampleModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });

const remove = (id) => SampleModel.findByIdAndDelete(id);

module.exports = { getAll, getById, create, update, remove };
