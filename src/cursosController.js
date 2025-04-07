import mysql from "mysql2/promise";

async function connect() {
  if (global.connection && global.connection.state !== "disconnected") {
    return global.connection;
  }

  const connection = await mysql.createConnection({
    host: "54.91.193.137",
    user: "libertas",
    password: "123456",
    database: "libertas5per",
  });
  global.connection = connection;
  return connection;
}

// Função de migration para criar a tabela 'curso' se ela não existir
async function migrate() {
  const con = await connect();
  const sql = `
    CREATE TABLE IF NOT EXISTS curso (
      idcurso INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      descricao TEXT,
      cargaHoraria VARCHAR(50),
      valor DECIMAL(10,2)
    );
  `;
  try {
    await con.query(sql);
    console.log("Tabela 'curso' verificada/criada com sucesso.");
  } catch (error) {
    console.error("Erro ao criar tabela 'curso':", error);
  }
}

// Executa a migration assim que a aplicação iniciar
migrate();

export const post = async (req, res) => {
  try {
    const con = await connect();
    const sql =
      "INSERT INTO curso (nome, descricao, cargaHoraria, valor) VALUES (?, ?, ?, ?)";
    const values = [
      req.body.nome,
      req.body.descricao,
      req.body.cargaHoraria,
      req.body.valor,
    ];
    const [result] = await con.query(sql, values);
    res
      .status(201)
      .json({ message: "Curso criado com sucesso", id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar curso" });
  }
};

export const put = async (req, res) => {
  try {
    const con = await connect();
    const sql =
      "UPDATE curso SET nome = ?, descricao = ?, cargaHoraria = ?, valor = ? WHERE idcurso = ?";
    const values = [
      req.body.nome,
      req.body.descricao,
      req.body.cargaHoraria,
      req.body.valor,
      req.params.id,
    ];
    const [result] = await con.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Curso não encontrado" });
    }
    res.status(200).json({ message: "Curso atualizado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar curso" });
  }
};

export const deleteCurso = async (req, res) => {
  try {
    const con = await connect();
    const sql = "DELETE FROM curso WHERE idcurso = ?";
    const [result] = await con.query(sql, [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Curso não encontrado" });
    }
    res.status(200).json({ message: "Curso excluído com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao excluir curso" });
  }
};

export const get = async (req, res) => {
  try {
    const con = await connect();
    const [rows] = await con.query("SELECT * FROM curso");
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar cursos" });
  }
};

export const getById = async (req, res) => {
  try {
    const con = await connect();
    const sql = "SELECT * FROM curso WHERE idcurso = ?";
    const [rows] = await con.query(sql, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Curso não encontrado" });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar curso por ID" });
  }
};
