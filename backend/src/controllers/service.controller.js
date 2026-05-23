const serviceService = require('../services/service.service');

class ServiceController {
  async list(req, res, next) {
    try {
      const role = req.user?.role;
      const services = await serviceService.listServices(role);
      res.status(200).json(services);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const newService = await serviceService.createService(req.body);
      res.status(201).json({ message: 'Serviço criado com sucesso', service: newService });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updatedService = await serviceService.updateService(req.params.id, req.body);
      res.status(200).json({ message: 'Serviço atualizado com sucesso', service: updatedService });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await serviceService.deleteService(req.params.id);
      res.status(200).json({ message: 'Serviço removido com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ServiceController();
