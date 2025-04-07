// server.js (versão final sem OpenAI)
import express from "express";
import cors from "cors";
import path from "path";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

// Rotas para gerenciamento de cursos podem ser configuradas
// via importação dinâmica (veja ./src/index.js)
// Caso seja necessário, é possível adicionar rotas específicas aqui,
// por exemplo:
// app.post("/curso", async (req, res) => { ... });

// Importação dinâmica para o arquivo ./src/index.js
import("./src/index.js")
  .then((module) => {
    module.default(app);
  })
  .catch((err) => {
    console.error("Erro ao importar ./src/index.js:", err);
  });

// Iniciar servidor
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
