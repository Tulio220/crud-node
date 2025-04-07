import * as cursoController from "./cursosController.js";

export default (app) => {
  app.post("/curso", cursoController.post);
  app.put("/curso/:id", cursoController.put);
  app.delete("/curso/:id", cursoController.deleteCurso);
  app.get("/curso", cursoController.get);
  app.get("/curso/:id", cursoController.getById);
};
